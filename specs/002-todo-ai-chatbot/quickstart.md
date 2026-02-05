# Quickstart: Todo AI Chatbot

## Prerequisites

1. **Environment Variables**:
   Ensure `OPENAI_API_KEY` is set in `backend/.env`.

2. **Dependencies**:
   ```bash
   cd backend
   pip install openai-agents-sdk mcp
   cd ../frontend
   npm install ai lucide-react
   ```

## Running the Feature

1. **Start Backend**:
   ```bash
   cd backend
   # Ensure venv is active
   python -m app.main
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access**:
   Navigate to `http://localhost:3000/dashboard/chat`.

## Verification

### Manual Test
1. Log in.
2. Go to `/dashboard/chat`.
3. Type: "Add a task to call Mom".
4. Check if bot confirms.
5. Go to `/dashboard` (Todo list) and verify task "Call Mom" exists.

### Automated Tests
```bash
cd backend
pytest tests/api/test_chat.py
```
