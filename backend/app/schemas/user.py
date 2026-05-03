from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    email: str = Field(max_length=200)
    password: str = Field(min_length=6, max_length=100)
    nickname: Optional[str] = ""


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    nickname: str
    avatar_url: str
    is_active: bool
    coins: int
    experience: int
    level: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
