# Research: Todo AI Chatbot

**Feature**: `002-todo-ai-chatbot`
**Date**: 2026-01-08

## Technical Decisions

### 1. Backend Architecture: OpenAI Agents SDK & MCP

**Decision**: Implement AI logic using the `openai-agents-sdk` and `mcp` libraries directly within the FastAPI application.

**Rationale**:
- **Statelessness**: The constitution requires a stateless architecture. The Agent will run per-request, re-hydrating state from the database.
- **MCP Integration**: Using the official `mcp` SDK allows us to define tools (`add_task`, etc.) in a standard way that the Agent can consume.
- **Simplicity**: Keeping it within the existing FastAPI service avoids the complexity of a separate microservice (violates YAGNI for now).

**Alternatives Considered**:
- **LangChain**: Too heavy and abstract for this specific requirement.
- **Custom Loop**: Building a raw loop with OpenAI API is possible but `openai-agents-sdk` provides better structure for tool calling and agent patterns mandated by Phase III.

### 2. Frontend Integration: OpenAI ChatKit

**Decision**: Use `openai-chatkit` components integrated into a new page `/dashboard/chat`.

**Rationale**:
- **Requirement**: Specified in Phase III PDF and Constitution.
- **Speed**: ChatKit provides pre-built UI components for chat interfaces, reducing frontend effort.
- **Integration**: React components drop easily into the Next.js App Router structure.

**Implementation Details**:
- Route: `frontend/src/app/(dashboard)/chat/page.tsx`
- Components: `Chat`, `MessageList`, `Input` from ChatKit (or equivalent available library, assuming "ChatKit" refers to a specific OpenAI-compatible UI library or we build the UI to match the "ChatKit" style if it's a conceptual reference in the hackathon - *Self-Correction*: I will assume "OpenAI ChatKit" refers to the `ai/rsc` or Vercel AI SDK UI components often used with OpenAI, or a specific library provided in the hackathon context. Given the strict "OpenAI ChatKit" naming, I will look for a package named similar to that or use the Vercel AI SDK `useChat` hook which is the standard for Next.js + OpenAI). *Correction*: The PDF explicitly says "OpenAI ChatKit". I will assume this is a library I need to install. If it doesn't exist on npm, I will fall back to Vercel AI SDK (`ai` package) which is the industry standard for this stack.

### 3. Database Schema

**Decision**: Add `Conversation` and `Message` models to SQLModel.

**Schema**:
- `Conversation`: `id` (UUID), `user_id` (Foreign Key), `created_at`, `updated_at`.
- `Message`: `id` (UUID), `conversation_id` (Foreign Key), `role` (enum: user/assistant), `content` (Text), `tool_calls` (JSON/Text - optional, to store tool usage), `created_at`.

**Rationale**:
- **Persistence**: Required for conversation history.
- **Relational**: Maps naturally to the existing User and Task models (User has many Conversations).

### 4. Auth & Context

**Decision**: Reuse `Better Auth` token from the request header.

**Mechanism**:
- The `/api/chat` endpoint will be protected by the existing `get_current_user` dependency.
- `user_id` from the token identifies the conversation owner.

## Open Questions & Resolutions

**Q: Does "OpenAI ChatKit" refer to a specific proprietary library or the Vercel AI SDK?**
**Resolution**: I will search for "OpenAI ChatKit" in the context of the hackathon materials. If not found, I will treat it as "build a UI using Vercel AI SDK (`ai` + `@ai-sdk/react`)" which provides the `useChat` hook and UI components. *Assumption*: For the plan, I will specify `ai` (Vercel AI SDK) as the implementation library as it's the standard implementation of "ChatKit" patterns in Next.js.

**Q: How to handle MCP Tool execution in a stateless request?**
**Resolution**:
1. Retrieve conversation history (sliding window N=20).
2. Initialize Agent with `tools=[add_task, list_tasks, ...]`.
3. Pass user message + history to Agent.
4. Agent runs, may call tools.
5. **Tool Execution**: Tools execute *synchronously* (or awaited async) within the request lifecycle against the database.
6. Agent generates final response.
7. Save new User message and Assistant response (and intermediate tool outputs if needed for debug) to DB.
8. Return response.

## Prerequisites

- `pip install openai-agents-sdk mcp` (Check exact package names).
- `npm install ai` (Frontend SDK).
