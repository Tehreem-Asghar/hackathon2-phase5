# Data Model: Todo AI Chatbot

## Entities

### Conversation
Represents a chat session for a user.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary Key |
| `user_id` | UUID | Yes | Foreign Key to User (Owner) |
| `title` | String | No | Auto-generated title (optional optimization) |
| `created_at` | DateTime | Yes | Timestamp |
| `updated_at` | DateTime | Yes | Timestamp |

### Message
Represents a single message in a conversation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary Key |
| `conversation_id` | UUID | Yes | Foreign Key to Conversation |
| `role` | Enum | Yes | `user` or `assistant` (or `system`) |
| `content` | Text | Yes | The message content |
| `tool_calls` | JSON | No | Stores tool call details (name, args) if applicable |
| `created_at` | DateTime | Yes | Timestamp |

### Relationships

- **User** `1:N` **Conversation**
- **Conversation** `1:N` **Message**

## SQLModel Definitions (Draft)

```python
# backend/app/models/conversation.py
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from typing import List, Optional

class ConversationBase(SQLModel):
    title: Optional[str] = None

class Conversation(ConversationBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    messages: List["Message"] = Relationship(back_populates="conversation")

# backend/app/models/message.py
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, Any
from pydantic import Json

class Message(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id", index=True)
    role: str # "user", "assistant", "system"
    content: str
    tool_calls: Optional[str] = None # JSON string of tool calls
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
```
