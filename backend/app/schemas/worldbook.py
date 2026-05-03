from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WorldBookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subtitle: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = "奇幻"
    tags: Optional[str] = ""
    worldview: Optional[str] = ""
    timeline: Optional[str] = ""
    world_rules: Optional[str] = ""
    geography: Optional[str] = ""
    culture: Optional[str] = ""
    history: Optional[str] = ""
    races: Optional[str] = ""
    factions: Optional[str] = ""
    gods: Optional[str] = ""
    artifacts: Optional[str] = ""


class WorldBookUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    worldview: Optional[str] = None
    timeline: Optional[str] = None
    world_rules: Optional[str] = None
    geography: Optional[str] = None
    culture: Optional[str] = None
    history: Optional[str] = None
    races: Optional[str] = None
    factions: Optional[str] = None
    gods: Optional[str] = None
    artifacts: Optional[str] = None
    is_published: Optional[bool] = None
    price: Optional[int] = None


class WorldBookOut(BaseModel):
    id: int
    title: str
    subtitle: str
    description: str
    cover_url: str
    category: str
    tags: str
    price: int
    is_published: bool
    is_featured: bool
    play_count: int
    like_count: int
    version: int
    worldview: str
    timeline: str
    world_rules: str
    geography: str
    culture: str
    history: str
    races: str
    factions: str
    gods: str
    artifacts: str
    creator_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SceneCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    scene_type: Optional[str] = "normal"
    visual_prompt: Optional[str] = ""
    order_index: int = 0


class SceneOut(BaseModel):
    id: int
    name: str
    description: str
    scene_type: str
    visual_prompt: str
    video_url: str
    image_url: str
    duration_seconds: float
    is_generated: bool
    generation_status: str
    worldbook_id: int
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True


class BranchCreate(BaseModel):
    choice_text: str
    choice_id: str
    description: Optional[str] = ""
    is_hot: bool = False


class BranchOut(BaseModel):
    id: int
    choice_text: str
    choice_id: str
    description: str
    is_hot: bool
    choice_count: int
    from_scene_id: int
    to_scene_id: Optional[int]

    class Config:
        from_attributes = True
