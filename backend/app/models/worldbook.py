from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Boolean, DateTime, Integer, Float, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class WorldBook(Base):
    __tablename__ = "worldbooks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    subtitle: Mapped[str] = mapped_column(String(200), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    cover_url: Mapped[str] = mapped_column(String(500), default="")
    category: Mapped[str] = mapped_column(String(50), default="奇幻", index=True)
    tags: Mapped[str] = mapped_column(String(500), default="")
    price: Mapped[int] = mapped_column(Integer, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    play_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    version: Mapped[int] = mapped_column(Integer, default=1)

    worldview: Mapped[str] = mapped_column(Text, default="")
    timeline: Mapped[str] = mapped_column(Text, default="")
    world_rules: Mapped[str] = mapped_column(Text, default="")
    geography: Mapped[str] = mapped_column(Text, default="")
    culture: Mapped[str] = mapped_column(Text, default="")
    history: Mapped[str] = mapped_column(Text, default="")
    races: Mapped[str] = mapped_column(Text, default="")
    factions: Mapped[str] = mapped_column(Text, default="")
    gods: Mapped[str] = mapped_column(Text, default="")
    artifacts: Mapped[str] = mapped_column(Text, default="")
    extras_json: Mapped[str] = mapped_column(Text, default="{}")

    creator_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="worldbooks")
    chapters = relationship("WorldBookChapter", back_populates="worldbook", cascade="all, delete-orphan", order_by="WorldBookChapter.order_index")
    scenes = relationship("Scene", back_populates="worldbook", cascade="all, delete-orphan")


class WorldBookChapter(Base):
    __tablename__ = "worldbook_chapters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    is_opening: Mapped[bool] = mapped_column(Boolean, default=False)

    worldbook_id: Mapped[int] = mapped_column(Integer, ForeignKey("worldbooks.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    worldbook = relationship("WorldBook", back_populates="chapters")


class Scene(Base):
    __tablename__ = "scenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    scene_type: Mapped[str] = mapped_column(String(50), default="normal")
    visual_prompt: Mapped[str] = mapped_column(Text, default="")
    video_url: Mapped[str] = mapped_column(String(500), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    duration_seconds: Mapped[float] = mapped_column(Float, default=5.0)
    is_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    generation_status: Mapped[str] = mapped_column(String(50), default="pending")

    worldbook_id: Mapped[int] = mapped_column(Integer, ForeignKey("worldbooks.id"), nullable=False, index=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    worldbook = relationship("WorldBook", back_populates="scenes")
    branches_out = relationship("StoryBranch", back_populates="from_scene", cascade="all, delete-orphan", foreign_keys="StoryBranch.from_scene_id")
    branches_in = relationship("StoryBranch", back_populates="to_scene", foreign_keys="StoryBranch.to_scene_id")


class StoryBranch(Base):
    __tablename__ = "story_branches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    choice_text: Mapped[str] = mapped_column(String(300), nullable=False)
    choice_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    is_hot: Mapped[bool] = mapped_column(Boolean, default=False)
    choice_count: Mapped[int] = mapped_column(Integer, default=0)
    required_level: Mapped[int] = mapped_column(Integer, default=0)
    required_item: Mapped[str] = mapped_column(String(200), default="")

    from_scene_id: Mapped[int] = mapped_column(Integer, ForeignKey("scenes.id"), nullable=False, index=True)
    to_scene_id: Mapped[int] = mapped_column(Integer, ForeignKey("scenes.id"), nullable=True)

    from_scene = relationship("Scene", back_populates="branches_out", foreign_keys=[from_scene_id])
    to_scene = relationship("Scene", back_populates="branches_in", foreign_keys=[to_scene_id])
