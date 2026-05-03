from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ...core.database import get_db
from ...core.security import get_current_active_user
from ...models.user import User
from ...models.worldbook import WorldBook, Scene, StoryBranch
from ...models.character import CharacterCard as Character
from ...schemas.ai import (
    AIGenerateWorldviewRequest, AIGenerateOpeningRequest,
    AIGenerateSceneRequest, AIGenerateBranchesRequest,
    AIGenerateImageRequest, AIGenerateVideoRequest,
    AIGenerateResponse, AIImageResponse, AIVideoResponse,
)
from ...services.ai_service import ai_service, AIServiceError

router = APIRouter()


@router.post("/generate-worldview")
async def generate_worldview_endpoint(
    data: AIGenerateWorldviewRequest,
    current_user: User = Depends(get_current_active_user),
):
    content, model, tokens = await ai_service.generate_worldview(
        data.user_input, data.style, stream=False
    )
    return AIGenerateResponse(content=content, model_used=model, tokens_used=tokens)


@router.post("/generate-worldview-stream")
async def generate_worldview_stream(
    data: AIGenerateWorldviewRequest,
    current_user: User = Depends(get_current_active_user),
):
    async def event_stream():
        async for chunk in ai_service.generate_worldview(data.user_input, data.style, stream=True):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/generate-opening")
async def generate_opening(
    data: AIGenerateOpeningRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(WorldBook).where(WorldBook.id == data.worldbook_id))
    worldbook = result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")

    character_context = ""
    if data.character_id:
        char_result = await db.execute(
            select(Character).where(Character.id == data.character_id)
        )
        character = char_result.scalar_one_or_none()
        if character:
            parts = []
            if character.name:
                parts.append(f"角色名：{character.name}")
            if character.title:
                parts.append(f"称号：{character.title}")
            if character.identity:
                parts.append(f"身份：{character.identity}")
            if character.gender and character.gender != "未知":
                parts.append(f"性别：{character.gender}")
            if character.age:
                parts.append(f"年龄：{character.age}")
            if character.appearance:
                parts.append(f"外貌：{character.appearance}")
            if character.personality:
                parts.append(f"性格：{character.personality}")
            if character.background:
                parts.append(f"背景：{character.background}")
            if character.beliefs:
                parts.append(f"理念：{character.beliefs}")
            parts.append(f"属性：力量{character.strength} 敏捷{character.agility} 智力{character.intelligence} 魅力{character.charisma} 等级{character.level}")
            character_context = "；".join(parts)

    content, model, tokens = await ai_service.generate_opening_story(
        worldbook.worldview, worldbook.title, character_context
    )
    return AIGenerateResponse(content=content, model_used=model, tokens_used=tokens)


@router.post("/generate-opening-stream")
async def generate_opening_stream(
    data: AIGenerateOpeningRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(WorldBook).where(WorldBook.id == data.worldbook_id))
    worldbook = result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")

    character_context = ""
    if data.character_id:
        char_result = await db.execute(
            select(Character).where(Character.id == data.character_id)
        )
        character = char_result.scalar_one_or_none()
        if character:
            parts = []
            if character.name:
                parts.append(f"角色名：{character.name}")
            if character.title:
                parts.append(f"称号：{character.title}")
            if character.identity:
                parts.append(f"身份：{character.identity}")
            if character.gender and character.gender != "未知":
                parts.append(f"性别：{character.gender}")
            if character.age:
                parts.append(f"年龄：{character.age}")
            if character.appearance:
                parts.append(f"外貌：{character.appearance}")
            if character.personality:
                parts.append(f"性格：{character.personality}")
            if character.background:
                parts.append(f"背景：{character.background}")
            if character.beliefs:
                parts.append(f"理念：{character.beliefs}")
            parts.append(f"属性：力量{character.strength} 敏捷{character.agility} 智力{character.intelligence} 魅力{character.charisma} 等级{character.level}")
            character_context = "；".join(parts)

    async def event_stream():
        async for chunk in ai_service.generate_opening_story(
            worldbook.worldview, worldbook.title, character_context, stream=True
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/generate-scene")
async def generate_scene(
    data: AIGenerateSceneRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(WorldBook).where(WorldBook.id == data.worldbook_id))
    worldbook = result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")

    content = await ai_service.generate_scene_description(
        worldbook.worldview, data.scene_name, data.scene_description, data.previous_scene_context
    )
    visual_prompt = await ai_service.generate_visual_prompt(content)

    scene = Scene(
        name=data.scene_name,
        description=content,
        visual_prompt=visual_prompt,
        worldbook_id=data.worldbook_id,
    )
    db.add(scene)
    await db.flush()
    await db.refresh(scene)

    return {
        "scene_id": scene.id,
        "name": scene.name,
        "description": scene.description,
        "visual_prompt": scene.visual_prompt,
    }


@router.post("/generate-branches")
async def generate_branches(
    data: AIGenerateBranchesRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(WorldBook).where(WorldBook.id == data.worldbook_id))
    worldbook = result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")

    scene_result = await db.execute(select(Scene).where(Scene.id == data.scene_id))
    scene = scene_result.scalar_one_or_none()
    if not scene:
        raise HTTPException(status_code=404, detail="场景不存在")

    branches_data = await ai_service.generate_branches(
        worldbook.worldview, scene.description, data.num_branches
    )

    created_branches = []
    for b in branches_data:
        branch = StoryBranch(
            choice_text=b.get("choice_text", ""),
            choice_id=b.get("choice_id", ""),
            description=b.get("description", ""),
            is_hot=b.get("is_hot", False),
            from_scene_id=scene.id,
        )
        db.add(branch)
        created_branches.append(b)

    await db.flush()
    return [{"id": b.id, "choice_text": b.choice_text, "choice_id": b.choice_id, "description": b.description, "is_hot": b.is_hot} for b in created_branches]


@router.post("/generate-image")
async def generate_image(
    data: AIGenerateImageRequest,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.generate_image(data.prompt, data.size)
    return AIImageResponse(**result)


@router.post("/generate-video")
async def generate_video(
    data: AIGenerateVideoRequest,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.generate_video(data.image_url, data.prompt, data.duration)
    return AIVideoResponse(**result)
