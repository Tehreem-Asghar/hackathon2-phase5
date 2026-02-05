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
