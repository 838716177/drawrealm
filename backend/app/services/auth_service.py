from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from ..models.user import User
from ..core.security import hash_password, verify_password, create_access_token
from ..schemas.user import UserRegister, UserLogin, TokenResponse, UserOut


class AuthService:
    @staticmethod
    async def register(db: AsyncSession, data: UserRegister) -> UserOut:
        existing = await db.execute(
            select(User).where((User.username == data.username) | (User.email == data.email))
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名或邮箱已被注册"
            )

        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
            nickname=data.nickname or data.username,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return UserOut.model_validate(user)

    @staticmethod
    async def login(db: AsyncSession, data: UserLogin) -> TokenResponse:
        result = await db.execute(
            select(User).where(User.username == data.username)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="账号已被禁用"
            )

        access_token = create_access_token(data={"sub": str(user.id), "username": user.username})
        return TokenResponse(
            access_token=access_token,
            user=UserOut.model_validate(user),
        )

    @staticmethod
    async def get_current_user_info(user: User) -> UserOut:
        return UserOut.model_validate(user)
