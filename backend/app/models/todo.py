from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, Column
from sqlalchemy.dialects.postgresql import JSONB


class TodoPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TodoRecurrence(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class Todo(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True, index=True, nullable=False)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: bool = Field(default=False, nullable=False)
    priority: TodoPriority = Field(default=TodoPriority.MEDIUM, nullable=False)
    due_date: Optional[datetime] = Field(default=None)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSONB))
    recurrence: TodoRecurrence = Field(default=TodoRecurrence.NONE, nullable=False)
    parent_id: Optional[UUID] = Field(default=None, foreign_key="todo.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
