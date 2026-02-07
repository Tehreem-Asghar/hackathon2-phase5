from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, cast, String, text
from sqlalchemy.dialects.postgresql import JSONB

from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.todo import Todo, TodoPriority, TodoRecurrence
from app.models.user import User
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate

router = APIRouter()


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    *,
    session: AsyncSession = Depends(get_session),
    todo_in: TodoCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new todo.
    """
    todo_data = todo_in.dict()
    if todo_data.get("due_date") and todo_data["due_date"].tzinfo:
        todo_data["due_date"] = todo_data["due_date"].replace(tzinfo=None)
        
    todo = Todo(
        **todo_data,
        user_id=current_user.id
    )
    session.add(todo)
    await session.commit()
    await session.refresh(todo)
    return todo


@router.get("/", response_model=List[TodoResponse])
async def read_todos(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = None,
    priority: Optional[str] = None,
    tag: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc"
) -> Any:
    """
    Retrieve todos with search, filter, and sort options.
    """
    query = select(Todo).where(Todo.user_id == current_user.id)
    
    if search:
        # Search in title, description, and tags array (as string)
        search_filter = or_(
            Todo.title.ilike(f"%{search}%"),
            Todo.description.ilike(f"%{search}%"),
            cast(Todo.tags, String).ilike(f"%{search}%")
        )
        query = query.where(search_filter)
    
    if priority and priority != "":
        # Case-insensitive partial match for priority, matching search/tag logic
        query = query.where(cast(Todo.priority, String).ilike(f"%{priority}%"))
        
    if tag and tag != "":
        # Case-insensitive partial match for tags
        query = query.where(cast(Todo.tags, String).ilike(f"%{tag}%"))

    # Dynamic Sorting
    sort_column = getattr(Todo, sort_by, Todo.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    result = await session.execute(query)
    todos = result.scalars().all()
    return todos


@router.get("/{id}", response_model=TodoResponse)
async def read_todo(
    *,
    session: AsyncSession = Depends(get_session),
    id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get todo by ID.
    """
    result = await session.execute(
        select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    )
    todo = result.scalars().first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@router.put("/{id}", response_model=TodoResponse)
async def update_todo(
    *,
    session: AsyncSession = Depends(get_session),
    id: UUID,
    todo_in: TodoUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a todo.
    """
    result = await session.execute(
        select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    )
    todo = result.scalars().first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = todo_in.dict(exclude_unset=True)
    if update_data.get("due_date") and update_data["due_date"].tzinfo:
        update_data["due_date"] = update_data["due_date"].replace(tzinfo=None)

    for field, value in update_data.items():
        setattr(todo, field, value)
    
    todo.updated_at = datetime.utcnow()
    session.add(todo)
    await session.commit()
    await session.refresh(todo)
    return todo


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    *,
    session: AsyncSession = Depends(get_session),
    id: UUID,
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a todo.
    """
    result = await session.execute(
        select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    )
    todo = result.scalars().first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    # orphan children before deleting parent to avoid foreign key violation
    await session.execute(
        text("UPDATE todo SET parent_id = NULL WHERE parent_id = :id"),
        {"id": id}
    )
    
    await session.delete(todo)
    await session.commit()
    # No explicit return for 204 NO_CONTENT

@router.patch("/{id}/complete", response_model=TodoResponse)
async def complete_todo(
    *,
    session: AsyncSession = Depends(get_session),
    id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Toggle todo completion status and handle recurrence logic.
    """
    result = await session.execute(
        select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    )
    todo = result.scalars().first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    # Toggle completion
    todo.is_completed = not todo.is_completed
    todo.updated_at = datetime.utcnow()

    # Handle recurrence if marked as completed
    if todo.is_completed and todo.recurrence != TodoRecurrence.NONE:
        from datetime import timedelta
        from dateutil.relativedelta import relativedelta

        next_due_date = None
        if todo.due_date:
            if todo.recurrence == TodoRecurrence.DAILY:
                next_due_date = todo.due_date + timedelta(days=1)
            elif todo.recurrence == TodoRecurrence.WEEKLY:
                next_due_date = todo.due_date + timedelta(weeks=1)
            elif todo.recurrence == TodoRecurrence.MONTHLY:
                next_due_date = todo.due_date + relativedelta(months=1)
        else:
            # If no due date, use today as base
            now = datetime.utcnow()
            if todo.recurrence == TodoRecurrence.DAILY:
                next_due_date = now + timedelta(days=1)
            elif todo.recurrence == TodoRecurrence.WEEKLY:
                next_due_date = now + timedelta(weeks=1)
            elif todo.recurrence == TodoRecurrence.MONTHLY:
                next_due_date = now + relativedelta(months=1)

        # Create new todo instance
        new_todo = Todo(
            user_id=todo.user_id,
            title=todo.title,
            description=todo.description,
            priority=todo.priority,
            tags=todo.tags,
            recurrence=todo.recurrence,
            due_date=next_due_date,
            parent_id=todo.id,
            is_completed=False
        )
        session.add(new_todo)

    session.add(todo)
    await session.commit()
    await session.refresh(todo)
    return todo
