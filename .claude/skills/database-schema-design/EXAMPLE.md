# Database Schema Design Implementation Example

This document provides a practical example of implementing database schemas using SQLModel with proper design patterns that can be applied across different projects.

## Setup

### 1. Install Dependencies

```bash
pip install sqlmodel sqlalchemy asyncpg psycopg2-binary python-dotenv
```

### 2. Create Base Models

Create `models/base.py`:

```python
from sqlmodel import SQLModel
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from typing import Optional
from uuid import UUID, uuid4
from pydantic import Field

class BaseSQLModel(SQLModel):
    """Base model with common fields for all entities."""
    pass

class TimestampMixin(SQLModel):
    """Mixin to add timestamp fields to models."""
    created_at: Optional[DateTime] = Field(default_factory=func.now())
    updated_at: Optional[DateTime] = Field(default_factory=func.now(), sa_column_kwargs={"onupdate": func.now()})
```

### 3. Create Generic Entity Model

Create `models/entity.py`:

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from .base import BaseSQLModel, TimestampMixin

class BaseEntity(BaseSQLModel, TimestampMixin, table=True):
    """Base entity with UUID primary key and timestamps."""
    __tablename__: str  # Subclasses should define this
    
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    is_active: bool = Field(default=True)
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}

# Example concrete model
class User(BaseEntity):
    __tablename__ = "users"
    
    email: str = Field(unique=True, index=True, nullable=False)
    name: str = Field(nullable=False)
    password_hash: str = Field(nullable=False)
    
    # Relationships
    todos: list["Todo"] = Relationship(back_populates="user")
```

### 4. Create Relationship Models

Create `models/relationships.py`:

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from .base import BaseSQLModel, TimestampMixin

# One-to-Many relationship example
class Category(BaseEntity):
    __tablename__ = "categories"
    
    name: str = Field(index=True, nullable=False)
    description: Optional[str] = Field(default=None)
    
    # One Category has many Items
    items: List["Item"] = Relationship(back_populates="category")

class Item(BaseEntity):
    __tablename__ = "items"
    
    name: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    category_id: UUID = Field(foreign_key="categories.id")
    
    # Many Items belong to one Category
    category: Optional[Category] = Relationship(back_populates="items")

# Many-to-Many relationship example using association table
class Project(BaseEntity):
    __tablename__ = "projects"
    
    name: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    
    # Many-to-many relationship with tags
    tags: List["Tag"] = Relationship(
        back_populates="projects",
        link_model=lambda: ProjectTag
    )

class Tag(BaseEntity):
    __tablename__ = "tags"
    
    name: str = Field(unique=True, index=True, nullable=False)
    
    # Many-to-many relationship with projects
    projects: List["Project"] = Relationship(
        back_populates="tags",
        link_model=lambda: ProjectTag
    )

class ProjectTag(BaseSQLModel, table=True):
    __tablename__ = "project_tags"
    
    project_id: UUID = Field(foreign_key="projects.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True)
```

### 5. Create Advanced Models with Constraints

Create `models/constraints.py`:

```python
from sqlmodel import SQLModel, Field, Column, String, CheckConstraint
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
from .base import BaseSQLModel, TimestampMixin

class PriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class StatusEnum(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(BaseEntity):
    __tablename__ = "tasks"
    
    title: str = Field(min_length=1, max_length=255, nullable=False)
    description: Optional[str] = Field(default=None)
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM)
    status: StatusEnum = Field(default=StatusEnum.PENDING)
    due_date: Optional[datetime] = Field(default=None)
    estimated_hours: Optional[float] = Field(default=None, ge=0.0)
    
    # Foreign key reference
    assigned_to_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    
    # Custom constraints
    __table_args__ = (
        CheckConstraint("estimated_hours >= 0", name="positive_estimated_hours"),
    )
```

### 6. Set Up Session Management

Create `db/session.py`:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/dbname")

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

# Initialize database tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
```

### 7. Using the Models in API Routes

Example usage in API routes:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
from uuid import UUID

from db.session import get_session
from models.entity import User, UserCreate
from models.todo import Todo

router = APIRouter()

@router.post("/users/", response_model=User)
async def create_user(user: UserCreate, session: AsyncSession = Depends(get_session)):
    db_user = User.from_orm(user)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user

@router.get("/users/{user_id}/todos", response_model=List[Todo])
async def get_user_todos(
    user_id: UUID,
    session: AsyncSession = Depends(get_session)
):
    statement = select(Todo).where(Todo.user_id == user_id)
    result = await session.execute(statement)
    todos = result.scalars().all()
    return todos
```

This example demonstrates how to implement a complete database schema design that follows best practices and can be reused across different projects with minimal modifications.