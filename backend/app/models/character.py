from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, Integer, Float, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class CharacterCard(Base):
    __tablename__ = "character_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), default="")
    identity: Mapped[str] = mapped_column(String(200), default="")
    gender: Mapped[str] = mapped_column(String(20), default="未知")
    age: Mapped[str] = mapped_column(String(50), default="")
    appearance: Mapped[str] = mapped_column(Text, default="")
    background: Mapped[str] = mapped_column(Text, default="")
    personality: Mapped[str] = mapped_column(Text, default="")
    beliefs: Mapped[str] = mapped_column(Text, default="")
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    worldbook_id: Mapped[int] = mapped_column(Integer, ForeignKey("worldbooks.id"), nullable=True, index=True)

    ip_type: Mapped[str] = mapped_column(String(50), default="original")
    ip_source: Mapped[str] = mapped_column(String(200), default="")
    ip_author: Mapped[str] = mapped_column(String(100), default="")
    ip_url: Mapped[str] = mapped_column(String(500), default="")

    level: Mapped[int] = mapped_column(Integer, default=1)
    health: Mapped[int] = mapped_column(Integer, default=100)
    max_health: Mapped[int] = mapped_column(Integer, default=100)
    mana: Mapped[int] = mapped_column(Integer, default=50)
    max_mana: Mapped[int] = mapped_column(Integer, default=50)
    strength: Mapped[int] = mapped_column(Integer, default=10)
    agility: Mapped[int] = mapped_column(Integer, default=10)
    intelligence: Mapped[int] = mapped_column(Integer, default=10)
    charisma: Mapped[int] = mapped_column(Integer, default=10)

    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    price: Mapped[int] = mapped_column(Integer, default=0)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)

    creator_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="characters")
    attributes = relationship("CharacterAttribute", back_populates="character", cascade="all, delete-orphan")
    skills = relationship("CharacterSkill", back_populates="character", cascade="all, delete-orphan")
    equipment = relationship("CharacterEquipment", back_populates="character", cascade="all, delete-orphan")


class CharacterAttribute(Base):
    __tablename__ = "character_attributes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[int] = mapped_column(Integer, default=0)
    max_value: Mapped[int] = mapped_column(Integer, default=100)

    character_id: Mapped[int] = mapped_column(Integer, ForeignKey("character_cards.id"), nullable=False, index=True)

    character = relationship("CharacterCard", back_populates="attributes")


class CharacterSkill(Base):
    __tablename__ = "character_skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    level: Mapped[int] = mapped_column(Integer, default=1)
    max_level: Mapped[int] = mapped_column(Integer, default=10)
    skill_type: Mapped[str] = mapped_column(String(50), default="active")

    character_id: Mapped[int] = mapped_column(Integer, ForeignKey("character_cards.id"), nullable=False, index=True)

    character = relationship("CharacterCard", back_populates="skills")


class CharacterEquipment(Base):
    __tablename__ = "character_equipment"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    slot: Mapped[str] = mapped_column(String(50), default="accessory")
    quality: Mapped[str] = mapped_column(String(50), default="common")
    level_required: Mapped[int] = mapped_column(Integer, default=1)
    stats_bonus: Mapped[str] = mapped_column(Text, default="{}")

    character_id: Mapped[int] = mapped_column(Integer, ForeignKey("character_cards.id"), nullable=False, index=True)

    character = relationship("CharacterCard", back_populates="equipment")
