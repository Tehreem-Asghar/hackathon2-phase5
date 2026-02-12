# AI Agent Development Implementation Example

This document provides a practical example of implementing AI agents in your application with proper integration patterns.

## Agent Setup

### 1. Install Dependencies

```bash
pip install openai-agents python-dotenv nest_asyncio
```

### 2. Create Agent Configuration

Create `backend/app/agents/todo_agent.py`:

```python
import os
from agents import Agent, AsyncOpenAI, OpenAIChatCompletionsModel
from agents.run import RunConfig
import nest_asyncio
from .tools import add_task, list_tasks, complete_task, delete_task, update_task
from dotenv import load_dotenv

load_dotenv()
# Apply nest_asyncio
nest_asyncio.apply()

# Setup Gemini Client
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    # Fallback to OPENAI_API_KEY if GEMINI_API_KEY not set, or raise error
    gemini_api_key = os.getenv("OPENAI_API_KEY")

if not gemini_api_key:
    # Just a warning during import, will fail at runtime if used
    print("WARNING: GEMINI_API_KEY/OPENAI_API_KEY not found.")

external_client = AsyncOpenAI(
    api_key=gemini_api_key or "dummy", # Prevent init failure if key missing during build
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# Allow model configuration
model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

model = OpenAIChatCompletionsModel(
    model=model_name,
    openai_client=external_client
)

# Global config to be used by Runner
run_config = RunConfig(
    model=model,
    model_provider=external_client,
    tracing_disabled=True
)

def get_todo_agent(user_id: str) -> Agent:
    """
    Returns a configured AI agent for the specific user.
    """

    instructions = f"""
    You are a helpful Todo AI Assistant. Your job is to help the user manage their tasks.
    The current user's ID is: {user_id}.
    Always use this user_id when calling tools.

    You can:
    - Add new tasks (add_task): Extract 'title' and optional 'description' from the user's request. If the user provides details like "buy milk and get 2 gallons", use "Buy milk" as title and "Get 2 gallons" as description.
    - List tasks (list_tasks) - you can filter by pending, completed, or all.
    - Mark tasks as complete (complete_task)
    - Delete tasks (delete_task)
    - Update tasks (update_task)

    IMPORTANT: If the user refers to a task by name (e.g., "delete the milk task", "mark report as done"), YOU MUST FIRST call `list_tasks` to find the task ID. Do NOT ask the user for the ID. Find it yourself, then call the appropriate tool with the ID.

    When a user says "finish it" or "it's done" and they just listed tasks, look at the conversation history to find the task they are referring to.
    Always confirm actions to the user in a friendly way.
    If a task is not found even after listing, inform the user gracefully.
    """

    return Agent(
        name="Todo Assistant",
        instructions=instructions,
        tools=[add_task, list_tasks, complete_task, delete_task, update_task],
        model=model # Attach the Gemini model
    )

def get_agent_config() -> RunConfig:
    return run_config
```

### 3. Create Function Tools

Create `backend/app/agents/tools.py`:

```python
import json
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any
from sqlmodel import select
from agents import function_tool

from app.db.session import async_session
from app.models.todo import Todo

@function_tool
async def add_task(user_id: str, title: str, description: Optional[str] = None) -> str:
    """
    Create a new task for the user.
    """
    async with async_session() as session:
        todo = Todo(
            user_id=UUID(user_id),
            title=title,
            description=description
        )
        session.add(todo)
        await session.commit()
        await session.refresh(todo)
        return json.dumps({
            "task_id": str(todo.id),
            "status": "created",
            "title": todo.title
        })

@function_tool
async def list_tasks(user_id: str, status: Optional[str] = "all") -> str:
    """
    Retrieve tasks for the user, optionally filtered by status ('all', 'pending', 'completed').
    """
    async with async_session() as session:
        statement = select(Todo).where(Todo.user_id == UUID(user_id))

        if status == "pending":
            statement = statement.where(Todo.is_completed == False)
        elif status == "completed":
            statement = statement.where(Todo.is_completed == True)

        result = await session.execute(statement)
        todos = result.scalars().all()

        return json.dumps([
            {
                "id": str(t.id),
                "title": t.title,
                "completed": t.is_completed
            } for t in todos
        ])

@function_tool
async def complete_task(user_id: str, task_id: str) -> str:
    """
    Mark a specific task as complete.
    """
    async with async_session() as session:
        statement = select(Todo).where(Todo.user_id == UUID(user_id), Todo.id == UUID(task_id))
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            return json.dumps({"error": "Task not found"})

        todo.is_completed = True
        todo.updated_at = datetime.utcnow()
        session.add(todo)
        await session.commit()
        await session.refresh(todo)

        return json.dumps({
            "task_id": str(todo.id),
            "status": "completed",
            "title": todo.title
        })

@function_tool
async def delete_task(user_id: str, task_id: str) -> str:
    """
    Permanently remove a task.
    """
    async with async_session() as session:
        statement = select(Todo).where(Todo.user_id == UUID(user_id), Todo.id == UUID(task_id))
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            return json.dumps({"error": "Task not found"})

        await session.delete(todo)
        await session.commit()

        return json.dumps({
            "task_id": task_id,
            "status": "deleted"
        })

@function_tool
async def update_task(user_id: str, task_id: str, title: Optional[str] = None, description: Optional[str] = None) -> str:
    """
    Update the title or description of a task.
    """
    async with async_session() as session:
        statement = select(Todo).where(Todo.user_id == UUID(user_id), Todo.id == UUID(task_id))
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            return json.dumps({"error": "Task not found"})

        if title:
            todo.title = title
        if description:
            todo.description = description

        todo.updated_at = datetime.utcnow()
        session.add(todo)
        await session.commit()
        await session.refresh(todo)

        return json.dumps({
            "task_id": str(todo.id),
            "status": "updated",
            "title": todo.title
        })
```

### 4. Integrate with API Routes

In `backend/app/api/routes/chat.py`:

```python
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
    agent = get_todo_agent(str(current_user.id))
    config = get_agent_config()

    # Prepare history for the agent
    messages = []
    for msg in history_msgs:
        messages.append({"role": msg.role, "content": msg.content})

    # Add the current user message
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
        )
        session.add(assistant_msg)
        await session.commit()

        # 6. Return Response
        return ChatResponse(
            response=assistant_content,
            conversation_id=conversation_id,
        )

    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
```

This example demonstrates how to implement a complete AI agent system that integrates with your database and provides intelligent task management capabilities.