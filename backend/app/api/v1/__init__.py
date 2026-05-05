from fastapi import APIRouter
from .auth import router as auth_router
from .worldbooks import router as worldbooks_router
from .characters import router as characters_router
from .ai import router as ai_router
from .scenes import router as scenes_router

router = APIRouter(prefix="/v1")
router.include_router(auth_router, prefix="/auth", tags=["认证"])
router.include_router(worldbooks_router, prefix="/worldbooks", tags=["世界书"])
router.include_router(characters_router, prefix="/characters", tags=["角色卡"])
router.include_router(ai_router, prefix="/ai", tags=["AI生成"])
router.include_router(scenes_router, prefix="/scenes", tags=["场景剧情"])
