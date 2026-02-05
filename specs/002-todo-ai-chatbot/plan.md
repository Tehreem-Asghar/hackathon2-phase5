# Implementation Plan: Todo AI Chatbot

**Branch**: `002-todo-ai-chatbot` | **Date**: 2026-01-08 | **Spec**: `specs/002-todo-ai-chatbot/spec.md`
**Input**: Feature specification from `specs/002-todo-ai-chatbot/spec.md`

## Summary

Implement an AI-powered chatbot using OpenAI Agents SDK and MCP (Model Context Protocol). The chatbot will allow users to manage their todos (create, read, update, delete) via natural language. The system involves a new frontend route `/dashboard/chat`, a stateless backend endpoint `/api/chat` that persists history to a Postgres database, and an MCP server defining task management tools.

## Technical Context

**Language/Version**: Python 3.11 (Backend), TypeScript 5 (Frontend)
**Primary Dependencies**: 
- Backend: `fastapi`, `sqlmodel`, `openai-agents-sdk`, `mcp`
- Frontend: `next`, `ai` (Vercel AI SDK for ChatKit pattern), `lucide-react`
**Storage**: Neon Serverless PostgreSQL
**Testing**: `pytest` (Backend), `jest` (Frontend)
**Target Platform**: Vercel (Frontend), Vercel/Render (Backend)
**Project Type**: Full-stack web application
**Performance Goals**: <3s response time for chat interactions
**Constraints**: Stateless backend, persistent conversation history
**Scale/Scope**: Single-user session context, sliding window history (N=20)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Phase-Governed Development**: ✅ Phase III allows AI/Agents/MCP.
- **Technology Isolation**: ✅ Using permitted tech (Python, Next.js, Postgres) + Phase III additions.
- **Incremental Validity**: ✅ Adds new capability without breaking existing REST API.
- **API-First Design**: ✅ New `/api/chat` endpoint will be defined.
- **Test Discipline**: ✅ Integration tests will be written for the chat endpoint.
- **Minimal Complexity**: ✅ Reusing existing DB and Auth; keeping Agent logic in-process.

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-ai-chatbot/
├── plan.md              # This file
├── research.md          # Technical decisions
├── data-model.md        # Database schema changes
├── quickstart.md        # Testing instructions
└── contracts/           # API definitions
    └── openapi.yaml
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── chat.py           # NEW: Chat endpoint
│   ├── agents/                   # NEW: AI Logic
│   │   ├── __init__.py
│   │   ├── todo_agent.py         # Agent definition
│   │   └── tools.py              # MCP Tools implementation
│   ├── models/
│   │   ├── conversation.py       # NEW: Conversation models
│   │   └── message.py            # NEW: Message models
│   └── schemas/
│       └── chat.py               # NEW: Pydantic schemas for chat
└── tests/
    └── api/
        └── test_chat.py          # NEW: Chat tests

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── chat/
│   │           └── page.tsx      # NEW: Chat page
│   ├── components/
│   │   └── chat/                 # NEW: Chat UI components
│   │       ├── ChatInterface.tsx
│   │       └── MessageBubble.tsx
│   └── lib/
│       └── chat-api.ts           # NEW: Frontend API client
```

**Structure Decision**: Integrated module structure. Backend adds `agents/` directory for AI logic to separate it from standard CRUD routes. Frontend adds a specific dashboard page.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `agents` module | Organize AI/MCP logic | Putting it in `routes` would bloat the API layer. |
| New DB Tables | Persist chat history | Storing in memory violates statelessness; storing on client is insecure/limited. |