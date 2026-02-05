import json
from uuid import UUID
from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from agents import Runner

from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import ChatRequest, ChatResponse, ToolCallSchema
from app.agents.todo_agent import get_todo_agent, get_agent_config

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(
    *,
    session: AsyncSession = Depends(get_session),
    chat_in: ChatRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Send a message to the AI agent and get a response.
    """
    
    
    # 1. Get or Create Conversation
    conversation_id = chat_in.conversation_id
    if not conversation_id:
        conversation = Conversation(user_id=current_user.id)
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)
        conversation_id = conversation.id
    else:
        # Verify conversation belongs to user
        result = await session.execute(
            select(Conversation).where(
                Conversation.id == conversation_id, 
                Conversation.user_id == current_user.id
            )
        )
        conversation = result.scalars().first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

    # 2. Save User Message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=chat_in.message
    )
    session.add(user_msg)
    
    # 3. Fetch History (Sliding Window N=20)
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(20)
    )
    history_msgs = result.scalars().all()
    history_msgs.reverse() # Order by time asc for the agent
    
    # 4. Prepare Agent Input
    # The agents SDK Runner.run typically takes a message or a list of messages.
    # Depending on the SDK version, we might need to format history.
    # Here we use the last user message as the direct input.
    
    agent = get_todo_agent(str(current_user.id))
    config = get_agent_config()
    
    # Prepare history for the agent
    messages = []
    for msg in history_msgs:
        messages.append({"role": msg.role, "content": msg.content})
    
    # Add the current user message if it's not already in history (it shouldn't be yet in the list fetched)
    # Actually history_msgs includes the message we just added if we fetch after save? 
    # Let's check: we saved user_msg but didn't commit yet.
    # So history_msgs from select will NOT include the new user_msg unless we refresh/commit.
    # Better to just add it manually.
    messages.append({"role": "user", "content": chat_in.message})
    
    try:
        # Pass the full list of messages to the agent for context
        result = await Runner.run(agent, input=messages, run_config=config)
        
        assistant_content = result.final_output
        
        # 5. Save Assistant Message
        assistant_msg = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=assistant_content,
            # tool_calls=json.dumps(result.tool_calls) if hasattr(result, 'tool_calls') else None
        )
        session.add(assistant_msg)
        await session.commit()
        
        # 6. Return Response
        return ChatResponse(
            response=assistant_content,
            conversation_id=conversation_id,
            # tool_calls=[ToolCallSchema(tool=tc.tool, args=tc.args) for tc in result.tool_calls] if hasattr(result, 'tool_calls') else None
        )
        
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
