<!-- ---
id: 1
title: Phase II Technology Matrix
stage: constitution
date: 2026-01-04
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: TBD
command: /sp.constitution
labels: ["constitution","phase-governance","technology-matrix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
--- -->

## Prompt

Amend the global constitution technology matrix to reflect Phase II requirements as follows:

Phase II:
- Backend: Python REST API
- Database: Neon Serverless PostgreSQL
- ORM/Data layer: SQLModel or equivalent
- Frontend: Next.js (React, TypeScript)
- Authentication: Better Auth (signup/signin)
- Architecture: Full-stack web application


Phase III and later:
- Advanced cloud infrastructure, agents, AI, orchestration

Rules:
- Authentication is allowed starting Phase II
- Web frontend is allowed starting Phase II
- Neon PostgreSQL is allowed starting Phase II
- No AI or agent frameworks until later phases

This amendment must preserve phase isolation and act as the authoritative technology policy.

## Response snapshot

Created comprehensive constitution v1.0.0 with:
- 7 Core Principles: Phase-Governed Development, Technology Isolation, Incremental Validity, API-First Design, Test Discipline, Minimal Complexity, Observability
- Technology Matrix with 3 phases (Phase I: Backend API, Phase II: Full-Stack, Phase III: Advanced Capabilities)
- Project Standards covering code quality, testing, security, and performance
- Governance framework with amendment procedure, versioning policy, and compliance review

Phase I: Python REST API, SQLite, SQLModel, pytest
Phase II: Adds Next.js frontend, Neon PostgreSQL, Better Auth
Phase III: Reserved for cloud infrastructure, agents, AI, orchestration

Template validation completed: plan-template.md, spec-template.md, and tasks-template.md all align with the new phase-governed approach. No template changes required.

## Outcome

- Impact: Established authoritative technology policy with phase isolation
- Tests: No tests run (constitution amendment)
- Files: .specify/memory/constitution.md created/updated
- Next prompts: None (governance document complete)
- Reflection: Constitution successfully enforces phase boundaries while allowing technology evolution

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (governance document)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
