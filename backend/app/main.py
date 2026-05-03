from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .core.database import init_db
from .api.v1 import router as v1_router
from .services.ai_service import AIServiceError

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

origins = settings.CORS_ORIGINS
allow_creds = True
if origins == ["*"]:
    allow_creds = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(o) for o in origins],
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api")


@app.exception_handler(AIServiceError)
async def ai_service_error_handler(request, exc: AIServiceError):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
