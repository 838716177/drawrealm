from pydantic import BaseModel, Field
from typing import Optional


class AIGenerateWorldviewRequest(BaseModel):
    user_input: str = Field(min_length=2, max_length=2000)
    style: Optional[str] = "史诗奇幻"
    language: Optional[str] = "zh"


class AIGenerateOpeningRequest(BaseModel):
    worldbook_id: int
    character_id: Optional[int] = None
    style: Optional[str] = "电影感"


class AIGenerateSceneRequest(BaseModel):
    worldbook_id: int
    scene_name: str
    scene_description: str
    previous_scene_context: Optional[str] = ""


class AIGenerateBranchesRequest(BaseModel):
    worldbook_id: int
    scene_id: int
    num_branches: int = Field(default=3, ge=2, le=6)


class AIGenerateImageRequest(BaseModel):
    prompt: str = Field(max_length=4000)
    size: Optional[str] = "1024x1024"
    quality: Optional[str] = "standard"


class AIGenerateVideoRequest(BaseModel):
    image_url: str
    prompt: Optional[str] = ""
    duration: Optional[int] = 5


class AIGenerateResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    content: str
    model_used: str
    tokens_used: int = 0


class AIImageResponse(BaseModel):
    image_url: str
    prompt_used: str


class AIVideoResponse(BaseModel):
    video_url: str
    status: str
