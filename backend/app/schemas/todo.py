from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.todo import TodoPriority, TodoRecurrence

class TodoBase(BaseModel):
    title: str = Field(max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_completed: bool = False
    priority: TodoPriority = TodoPriority.MEDIUM
    due_date: Optional[datetime] = None
    tags: List[str] = []
    recurrence: TodoRecurrence = TodoRecurrence.NONE

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_completed: Optional[bool] = None
    priority: Optional[TodoPriority] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    recurrence: Optional[TodoRecurrence] = None

class TodoResponse(TodoBase):
    id: UUID
    user_id: UUID
    parent_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
