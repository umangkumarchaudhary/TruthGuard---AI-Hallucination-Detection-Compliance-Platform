from fastapi import APIRouter
from . import info

router = APIRouter(prefix="/api/v1", tags=["v1"])

router.include_router(info.router)

