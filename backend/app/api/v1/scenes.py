from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ...core.database import get_db
from ...core.security import get_current_active_user, get_optional_user
from ...models.user import User
from ...models.worldbook import WorldBook, Scene, StoryBranch
from ...schemas.worldbook import SceneCreate, SceneOut, BranchCreate, BranchOut

router = APIRouter()


@router.get("/worldbook/{worldbook_id}", response_model=list[SceneOut])
async def list_scenes(
    worldbook_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    result = await db.execute(
        select(Scene).where(Scene.worldbook_id == worldbook_id).order_by(Scene.order_index)
    )
    return result.scalars().all()


@router.post("/worldbook/{worldbook_id}", response_model=SceneOut, status_code=201)
async def create_scene(
    worldbook_id: int,
    data: SceneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    wb_result = await db.execute(select(WorldBook).where(WorldBook.id == worldbook_id))
    worldbook = wb_result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")

    scene = Scene(worldbook_id=worldbook_id, **data.model_dump())
    db.add(scene)
    await db.flush()
    await db.refresh(scene)
    return scene


@router.get("/{scene_id}/branches", response_model=list[BranchOut])
async def list_branches(
    scene_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StoryBranch).where(StoryBranch.from_scene_id == scene_id)
    )
    return result.scalars().all()


@router.post("/{scene_id}/branches", response_model=BranchOut, status_code=201)
async def create_branch(
    scene_id: int,
    data: BranchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    scene_result = await db.execute(select(Scene).where(Scene.id == scene_id))
    scene = scene_result.scalar_one_or_none()
    if not scene:
        raise HTTPException(status_code=404, detail="场景不存在")

    branch = StoryBranch(from_scene_id=scene_id, **data.model_dump())
    db.add(branch)
    await db.flush()
    await db.refresh(branch)
    return branch


@router.post("/{scene_id}/select-branch/{branch_id}")
async def select_branch(
    scene_id: int,
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    branch_result = await db.execute(select(StoryBranch).where(StoryBranch.id == branch_id))
    branch = branch_result.scalar_one_or_none()
    if not branch:
        raise HTTPException(status_code=404, detail="分支不存在")

    branch.choice_count += 1
    await db.flush()

    if branch.to_scene_id:
        next_scene_result = await db.execute(select(Scene).where(Scene.id == branch.to_scene_id))
        next_scene = next_scene_result.scalar_one_or_none()
        if next_scene:
            return {
                "branch_id": branch.id,
                "choice_text": branch.choice_text,
                "next_scene": {
                    "id": next_scene.id,
                    "name": next_scene.name,
                    "description": next_scene.description,
                    "video_url": next_scene.video_url,
                    "image_url": next_scene.image_url,
                }
            }

    return {
        "branch_id": branch.id,
        "choice_text": branch.choice_text,
        "next_scene": None,
        "message": "暂无后续场景，请等待内容生成"
    }
