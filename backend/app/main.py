from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.api.routes import auth, todos, chat
from app.core.config import settings
from app.db.session import engine
from app.models.user import User
from app.models.todo import Todo
from app.models.conversation import Conversation
from app.models.message import Message

from sqlalchemy import text

app = FastAPI(title=settings.PROJECT_NAME)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hackathon2-phase5-ac5i.vercel.app",
        "http://localhost:30000",
        "http://localhost:30001",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://hackathon2-phase3-five.vercel.app",
        "https://hackathon2-phase2-indol.vercel.app",

    ] + settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth, prefix="/api/auth", tags=["auth"])
app.include_router(todos, prefix="/api/todos", tags=["todos"])
app.include_router(chat, prefix="/api/chat", tags=["chat"])

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Todo.metadata.create_all)
        
        # Simple migrations
        try:
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS name VARCHAR'))
            await conn.execute(text("ALTER TABLE todo ADD COLUMN IF NOT EXISTS priority VARCHAR DEFAULT 'medium'"))
            await conn.execute(text("ALTER TABLE todo ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITHOUT TIME ZONE"))
            await conn.execute(text("ALTER TABLE todo ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'"))
            await conn.execute(text("ALTER TABLE todo ALTER COLUMN tags TYPE JSONB USING tags::jsonb"))
            await conn.execute(text("ALTER TABLE todo ADD COLUMN IF NOT EXISTS recurrence VARCHAR DEFAULT 'none'"))
            await conn.execute(text("ALTER TABLE todo ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES todo(id)"))
        except Exception as e:
            print(f"Migration note: {e}")

@app.get("/")
async def root():
    return {"message": "Hello World"}