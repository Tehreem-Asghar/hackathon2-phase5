# Database Schema Design Skill

## Description
A comprehensive skill for designing robust database schemas using SQLModel and SQLAlchemy. This skill provides guidance and templates for creating efficient, scalable database models with proper relationships, indexing, and validation.

## Features
- SQLModel-based database model creation
- Relationship design patterns (one-to-many, many-to-many, etc.)
- Indexing and performance optimization
- Data validation and constraints
- Migration strategies
- UUID usage for primary keys
- Timestamp management

## Generic Model Implementation

### 1. Base Model Template
```python
# models/base.py
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

### 2. Generic Entity Model
```python
# models/entity.py
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

### 3. Relationship Models
```python
# models/relationships.py
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

### 4. Advanced Model with Constraints
```python
# models/constraints.py
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
    
    # Indexes for common queries
    @classmethod
    def __table_args__(cls):
        return (
            # Additional indexes can be defined here
        )
```

### 5. Session Management
```python
# db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

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

## Best Practices

1. **Primary Keys**: Use UUIDs for primary keys to ensure global uniqueness and distributed systems compatibility
2. **Indexing**: Add indexes to frequently queried columns (especially foreign keys and unique constraints)
3. **Relationships**: Define proper relationships with back_populates for bidirectional access
4. **Validation**: Use Pydantic Field validators for data integrity
5. **Timestamps**: Include created_at and updated_at fields for audit trails
6. **Soft Deletes**: Consider using is_active flags instead of hard deletes
7. **Constraints**: Use database-level constraints for data integrity
8. **Normalization**: Follow database normalization rules to reduce redundancy

## Common Patterns

1. **Base Model Pattern**: Create a base model with common fields to avoid repetition
2. **Mixin Pattern**: Use mixins for common functionality like timestamps
3. **Factory Pattern**: Create factory functions for complex object creation
4. **Repository Pattern**: Implement repository classes for data access logic
5. **Migration Pattern**: Plan for schema evolution with migration scripts

## Performance Optimization

1. **Indexing Strategy**: Create indexes on columns used in WHERE, JOIN, ORDER BY clauses
2. **Query Optimization**: Use selectinload/joinedload to prevent N+1 query problems
3. **Connection Pooling**: Configure proper connection pool settings
4. **Batch Operations**: Use bulk operations for multiple record manipulations
5. **Caching**: Implement caching for frequently accessed static data

## Migration Strategies

1. **Version Control**: Keep schema changes in version control
2. **Automated Migrations**: Use Alembic for automated migration generation
3. **Rollback Plans**: Always have rollback strategies for failed migrations
4. **Data Backup**: Backup data before running migrations
5. **Testing**: Test migrations on copy of production data

## Troubleshooting

1. **Circular Dependencies**: Use string references for forward declarations in relationships
2. **Lazy Loading**: Understand lazy vs eager loading implications on performance
3. **Transaction Management**: Properly handle transactions to maintain data consistency
4. **Connection Issues**: Monitor connection pools and timeouts
5. **Memory Usage**: Be mindful of memory consumption with large result sets