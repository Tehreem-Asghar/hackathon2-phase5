from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .conversation import Conversation

class Message(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True, index=True, nullable=False)
    conversation_id: UUID = Field(foreign_key="conversation.id", index=True, nullable=False)
    role: str = Field(nullable=False) # "user", "assistant", "system"
    content: str = Field(nullable=False)
    tool_calls: Optional[str] = Field(default=None) # JSON string of tool calls
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
