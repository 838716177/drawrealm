from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from ...core.database import get_db
from ...core.security import get_current_active_user, get_optional_user
from ...models.user import User
from ...models.character import CharacterCard
from ...schemas.character import CharacterCardCreate, CharacterCardUpdate, CharacterCardOut

router = APIRouter()


@router.get("/", response_model=list[CharacterCardOut])
async def list_characters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    worldbook_id: Optional[int] = None,
    search: Optional[str] = None,
    my_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    query = select(CharacterCard)
    if my_only and current_user:
        query = query.where(CharacterCard.creator_id == current_user.id)
    elif not my_only:
        query = query.where(CharacterCard.is_published == True)
    if worldbook_id:
        query = query.where(CharacterCard.worldbook_id == worldbook_id)
    if search:
        query = query.where(CharacterCard.name.contains(search))
    query = query.order_by(CharacterCard.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=CharacterCardOut, status_code=201)
async def create_character(
    data: CharacterCardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    character = CharacterCard(creator_id=current_user.id, **data.model_dump())
    db.add(character)
    await db.flush()
    await db.refresh(character)
    return character


@router.get("/{character_id}", response_model=CharacterCardOut)
async def get_character(
    character_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    result = await db.execute(select(CharacterCard).where(CharacterCard.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="角色卡不存在")
    if not character.is_published and (not current_user or character.creator_id != current_user.id):
        raise HTTPException(status_code=403, detail="无权访问此角色卡")
    return character


@router.put("/{character_id}", response_model=CharacterCardOut)
async def update_character(
    character_id: int,
    data: CharacterCardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(CharacterCard).where(CharacterCard.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="角色卡不存在")
    if character.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改此角色卡")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(character, key, value)
    await db.flush()
    await db.refresh(character)
    return character


@router.delete("/{character_id}", status_code=204)
async def delete_character(
    character_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(CharacterCard).where(CharacterCard.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="角色卡不存在")
    if character.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此角色卡")
    await db.delete(character)
