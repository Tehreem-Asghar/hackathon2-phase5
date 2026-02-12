# Better-Auth Skill

## Description
A comprehensive skill for implementing authentication using the better-auth library in full-stack applications. This skill provides guidance and templates for setting up both frontend and backend authentication systems.

## Features
- Frontend authentication client setup
- Backend authentication API routes
- JWT token management
- User session handling
- Secure password hashing
- Cross-platform compatibility

## Frontend Implementation

### 1. Authentication Client Setup
```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    plugins: [
        jwtClient()
    ]
});
```

### 2. Authentication Configuration
```typescript
// src/lib/auth-config.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
    // Better Auth uses this secret for all signing, including JWTs.
    // It must match the backend's SECRET_KEY.
    secret: process.env.NEXT_PUBLIC_JWT_SECRET || "NDUKy9s9fo2pDo4EytYIdpleBpWCWCdU",
    plugins: [
        jwt({
            jwt: {
                expirationTime: "30m",
            },
        }),
    ],
});
```

### 3. Authentication Context Provider
```typescript
// src/lib/auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/signin');
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verify with backend
          const res = await api.fetch('/api/auth/me');
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      } else {
        // If no token and not on an auth page, redirect to signin
        const path = window.location.pathname;
        if (path !== '/signin' && path !== '/signup') {
            router.push('/signin');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [router, logout]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Backend Implementation

### 1. Authentication Routes
```python
# backend/app/api/routes/auth.py
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.session import get_session
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, session: AsyncSession = Depends(get_session)) -> Any:
    """
    Register a new user.
    """
    result = await session.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        name=user_in.name,
        password_hash=get_password_hash(user_in.password),
    )
    session.add(user)
    await session.commit()
    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }

@router.post("/login", response_model=AuthResponse)
async def login(user_in: UserLogin, session: AsyncSession = Depends(get_session)) -> Any:
    """
    Authenticate a user.
    """
    result = await session.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user.
    """
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name}
```

### 2. Security Module
```python
# backend/app/core/security.py
from datetime import datetime, timedelta
from typing import Any, Union
import bcrypt

from jose import jwt

from app.core.config import settings


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt expects bytes
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    # bcrypt expects bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string for storage
    return hashed.decode('utf-8')
```

### 3. Configuration
```python
# backend/app/core/config.py
from typing import List, Union
import json

from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseModel):
    PROJECT_NAME: str = "Full Stack Todo API"
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/dbname"
    SECRET_KEY: str = "your_super_secret_key_for_jwt_signing"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000"]'
    BACKEND_CORS_ORIGINS: List[str] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
```

## Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data like JWT secrets
2. **Token Expiration**: Set appropriate token expiration times (recommended 30 minutes for access tokens)
3. **Secure Password Storage**: Use bcrypt for password hashing
4. **CORS Configuration**: Properly configure CORS to allow only trusted origins
5. **Error Handling**: Implement proper error handling for authentication failures
6. **Session Management**: Clear tokens on logout to prevent unauthorized access

## Common Use Cases

1. **User Registration**: Implement secure user signup with validation
2. **User Login**: Authenticate users and issue JWT tokens
3. **Protected Routes**: Protect routes that require authentication
4. **User Profile Access**: Retrieve current user information
5. **Logout**: Clear user session and redirect appropriately

## Troubleshooting

1. **Token Validation Issues**: Ensure frontend and backend secrets match
2. **CORS Errors**: Check that your frontend URL is included in CORS origins
3. **Database Connection**: Verify database connection settings in environment variables
4. **JWT Expiration**: Handle token expiration gracefully with refresh mechanisms