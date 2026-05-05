from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CharacterCardCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    title: Optional[str] = ""
    identity: Optional[str] = ""
    gender: Optional[str] = "未知"
    age: Optional[str] = ""
    appearance: Optional[str] = ""
    background: Optional[str] = ""
    personality: Optional[str] = ""
    beliefs: Optional[str] = ""
    worldbook_id: Optional[int] = None
    ip_type: Optional[str] = "original"
    ip_source: Optional[str] = ""
    ip_author: Optional[str] = ""
    ip_url: Optional[str] = ""


class CharacterCardUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    identity: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[str] = None
    appearance: Optional[str] = None
    background: Optional[str] = None
    personality: Optional[str] = None
    beliefs: Optional[str] = None
    is_published: Optional[bool] = None
    price: Optional[int] = None


class CharacterCardOut(BaseModel):
    id: int
    name: str
    title: str
    identity: str
    gender: str
    age: str
    appearance: str
    background: str
    personality: str
    beliefs: str
    avatar_url: str
    worldbook_id: Optional[int]
    ip_type: str
    ip_source: str
    ip_author: str
    ip_url: str
    level: int
    health: int
    max_health: int
    mana: int
    max_mana: int
    strength: int
    agility: int
    intelligence: int
    charisma: int
    is_published: bool
    price: int
    usage_count: int
    creator_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
