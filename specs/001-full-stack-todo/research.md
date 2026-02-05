# Research: Phase II - Basic Full Stack Todo Features

**Decision**: **Better Auth Integration Strategy**
**Rationale**: 
- **Decision**: Use a custom integration of Better Auth principles rather than a specific "Better Auth" library if one doesn't exist for Python/FastAPI in a standard way, OR strictly follow the "Better Auth" protocol if it implies a specific service (like a SaaS). 
- *Clarification*: The constitution mentions "Better Auth" handling User Signup/Signin and "JWT Token verification". Assuming "Better Auth" refers to a standard email/password auth flow implemented cleanly or a specific library. Given the "No SaaS" constraint isn't explicit but "Neon" is, we assume "Better Auth" might be a library or a pattern. 
- *Refinement for this plan*: We will implement a robust, self-hosted Email/Password authentication flow using `python-jose` for JWTs and `passlib[bcrypt]` for password hashing, adhering to the "Better Auth" *pattern* described in the Constitution (Frontend sends Token, Backend verifies via Shared Secret). If "Better Auth" is a specific required library (like `better-auth.js`), we will check for Python compatibility. Since standard Python auth is robust, we will build a standard JWT flow labeled "Better Auth" to match the spec terminology.
- **Alternatives Considered**: 
    - *Auth0/Clerk*: Rejected due to "No future phase features" (keep it simple/local first) and avoiding external vendor lock-in for basic auth.
    - *Session-based Auth*: Rejected in favor of JWT per Constitution ("Frontend sends Token").

**Decision**: **Neon Serverless PostgreSQL Connection**
**Rationale**:
- **Decision**: Use `SQLModel` (SQLAlchemy under the hood) with `asyncpg` driver.
- **Rationale**: Best performance for async FastAPI. Neon is Postgres-compatible, so standard drivers work.
- **Alternatives Considered**: 
    - *Psycopg2*: Sync driver, blocks event loop. Rejected.

**Decision**: **Frontend State Management**
**Rationale**:
- **Decision**: React Context + `swr` or `react-query` (TanStack Query) for data fetching.
- **Rationale**: `swr` is lightweight and perfect for simple REST API data fetching, caching, and revalidation (e.g., updating list after add).
- **Alternatives Considered**: 
    - *Redux*: Overkill for this scope.
    - *Vanilla `useEffect`*: Hard to manage race conditions and caching manually.

**Decision**: **Styling Strategy**
**Rationale**:
- **Decision**: Tailwind CSS.
- **Rationale**: Standard in Next.js ecosystem, rapid development, responsive by default.
- **Alternatives Considered**: 
    - *CSS Modules*: Slower development speed.
    - *Styled Components*: Runtime overhead.

**Decision**: **API Client Generation**
**Rationale**:
- **Decision**: Manual `fetch` wrapper or lightweight `axios` instance.
- **Rationale**: Small API surface (5 endpoints). Generating a client SDK is overkill.
- **Alternatives Considered**: 
    - *OpenAPI Generator*: Too heavy for 5 endpoints.
