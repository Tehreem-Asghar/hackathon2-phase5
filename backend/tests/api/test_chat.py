import pytest
from httpx import AsyncClient
from uuid import uuid4
from app.main import app

@pytest.mark.asyncio
async def test_chat_create_task(client: AsyncClient, token_headers: dict):
    response = await client.post(
        "/api/chat/",
        json={"message": "Add a task to buy groceries"},
        headers=token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "conversation_id" in data

@pytest.mark.asyncio
async def test_chat_history_persistence(client: AsyncClient, token_headers: dict):
    # First message
    res1 = await client.post(
        "/api/chat/",
        json={"message": "Hello"},
        headers=token_headers
    )
    conv_id = res1.json()["conversation_id"]
    
    # Second message with same conv_id
    res2 = await client.post(
        "/api/chat/",
        json={"message": "What did I just say?", "conversation_id": conv_id},
        headers=token_headers
    )
    assert res2.status_code == 200
    assert res2.json()["conversation_id"] == conv_id

@pytest.mark.asyncio
async def test_chat_list_tasks(client: AsyncClient, token_headers: dict):
    # Seed a task first (assuming there's a todo endpoint or using chat)
    # Using chat to seed
    await client.post(
        "/api/chat/",
        json={"message": "Add a task to read book"},
        headers=token_headers
    )
    
    response = await client.post(
        "/api/chat/",
        json={"message": "What tasks do I have?"},
        headers=token_headers
    )
    assert response.status_code == 200
    # We can't easily assert the text content without a real LLM, 
    # but we verify the endpoint works and returns a response.
    assert len(response.json()["response"]) > 0

@pytest.mark.asyncio
async def test_chat_update_complete_task(client: AsyncClient, token_headers: dict):
    # 1. Add task
    res_add = await client.post(
        "/api/chat/",
        json={"message": "Add task UpdateMe"},
        headers=token_headers
    )
    conv_id = res_add.json()["conversation_id"]
    
    # 2. Update task
    res_update = await client.post(
        "/api/chat/",
        json={"message": "Rename UpdateMe to UpdatedTask", "conversation_id": conv_id},
        headers=token_headers
    )
    assert res_update.status_code == 200
    
    # 3. Complete task
    res_complete = await client.post(
        "/api/chat/",
        json={"message": "Mark UpdatedTask as done", "conversation_id": conv_id},
        headers=token_headers
    )
    assert res_complete.status_code == 200

@pytest.mark.asyncio
async def test_chat_delete_task(client: AsyncClient, token_headers: dict):
    # 1. Add task
    res_add = await client.post(
        "/api/chat/",
        json={"message": "Add task DeleteMe"},
        headers=token_headers
    )
    conv_id = res_add.json()["conversation_id"]
    
    # 2. Delete task
    res_delete = await client.post(
        "/api/chat/",
        json={"message": "Delete the task DeleteMe", "conversation_id": conv_id},
        headers=token_headers
    )
    assert res_delete.status_code == 200