from typing import Any, List
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.todo import Todo
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
    todo = Todo(
        **todo_in.dict(),
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
) -> Any:
    """
    Retrieve todos.
    """
    result = await session.execute(
        select(Todo)
        .where(Todo.user_id == current_user.id)
        .order_by(Todo.created_at.desc())
    )
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
    Toggle todo completion status (legacy endpoint support, can use PUT).
    """
    result = await session.execute(
        select(Todo).where(Todo.id == id, Todo.user_id == current_user.id)
    )
    todo = result.scalars().first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    todo.is_completed = not todo.is_completed
    todo.updated_at = datetime.utcnow()
    session.add(todo)
    await session.commit()
    await session.refresh(todo)
    return todo
