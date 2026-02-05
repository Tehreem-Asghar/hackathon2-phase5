# Data Model: Phase II - Basic Full Stack Todo Features

## Entities

### User
Represents a registered user of the application.

| Field | Type | Required | constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | UUID | Yes | Primary Key | Unique identifier for the user. |
| `email` | String | Yes | Unique, Email Format | User's email address. |
| `password_hash` | String | Yes | | Bcrypt hashed password. |
| `created_at` | DateTime | Yes | Default: Now | Timestamp of registration. |
| `updated_at` | DateTime | Yes | Default: Now | Timestamp of last update. |

### Todo
Represents a task created by a user.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | UUID | Yes | Primary Key | Unique identifier for the todo. |
| `user_id` | UUID | Yes | Foreign Key (User.id) | The owner of the todo. |
| `title` | String | Yes | Max 255 chars | The main content of the todo. |
| `description` | String | No | Max 1000 chars | Additional details. |
| `is_completed` | Boolean | Yes | Default: False | Status of the todo. |
| `created_at` | DateTime | Yes | Default: Now | Timestamp of creation. |
| `updated_at` | DateTime | Yes | Default: Now | Timestamp of last update. |

## Relationships

- **User** has many **Todos** (One-to-Many).
- **Todo** belongs to one **User**.
- *Cascade Delete*: If a User is deleted, their Todos should be deleted (though User deletion is not in scope for Phase II UI, the DB constraint should exist).

## Validation Rules

- **User**:
    - Email must be valid format.
    - Password must be at least 8 characters (enforced at API/Frontend level before hashing).
- **Todo**:
    - Title cannot be empty/whitespace only.
    - Title length <= 255.
    - Description length <= 1000.
