from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from ...core.database import get_db
from ...core.security import get_current_active_user, get_optional_user
from ...models.user import User
from ...models.worldbook import WorldBook
from ...schemas.worldbook import WorldBookCreate, WorldBookUpdate, WorldBookOut

router = APIRouter()


@router.get("/", response_model=list[WorldBookOut])
async def list_worldbooks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    my_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    query = select(WorldBook)
    if my_only and current_user:
        query = query.where(WorldBook.creator_id == current_user.id)
    elif not my_only:
        query = query.where(WorldBook.is_published == True)
    if category:
        query = query.where(WorldBook.category == category)
    if search:
        query = query.where(WorldBook.title.contains(search))
    query = query.order_by(WorldBook.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorldBook.category, func.count(WorldBook.id))
        .where(WorldBook.is_published == True)
        .group_by(WorldBook.category)
    )
    return [{"name": row[0], "count": row[1]} for row in result.all()]


@router.post("/", response_model=WorldBookOut, status_code=201)
async def create_worldbook(
    data: WorldBookCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing_count = await db.execute(
        select(func.count()).select_from(WorldBook).where(WorldBook.creator_id == current_user.id)
    )
    if existing_count.scalar() >= 50:
        raise HTTPException(status_code=400, detail="已达到最大世界书创建数量(50)")

    worldbook = WorldBook(creator_id=current_user.id, **data.model_dump())
    db.add(worldbook)
    await db.flush()
    await db.refresh(worldbook)
    return worldbook


@router.get("/{worldbook_id}", response_model=WorldBookOut)
async def get_worldbook(
    worldbook_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    result = await db.execute(select(WorldBook).where(WorldBook.id == worldbook_id))
    worldbook = result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")
    if not worldbook.is_published and (not current_user or worldbook.creator_id != current_user.id):
        raise HTTPException(status_code=403, detail="无权访问此世界书")
    return worldbook


@router.put("/{worldbook_id}", response_model=WorldBookOut)
async def update_worldbook(
    worldbook_id: int,
    data: WorldBookUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(WorldBook).where(WorldBook.id == worldbook_id))
    worldbook = result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")
    if worldbook.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改此世界书")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(worldbook, key, value)
    await db.flush()
    await db.refresh(worldbook)
    return worldbook


@router.delete("/{worldbook_id}", status_code=204)
async def delete_worldbook(
    worldbook_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(WorldBook).where(WorldBook.id == worldbook_id))
    worldbook = result.scalar_one_or_none()
    if not worldbook:
        raise HTTPException(status_code=404, detail="世界书不存在")
    if worldbook.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此世界书")
    await db.delete(worldbook)
