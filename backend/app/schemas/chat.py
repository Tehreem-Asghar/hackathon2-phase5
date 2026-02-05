from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[UUID] = None

class ToolCallSchema(BaseModel):
    tool: str
    args: dict[str, Any]

class ChatResponse(BaseModel):
    response: str
    conversation_id: UUID
    tool_calls: Optional[List[ToolCallSchema]] = None
