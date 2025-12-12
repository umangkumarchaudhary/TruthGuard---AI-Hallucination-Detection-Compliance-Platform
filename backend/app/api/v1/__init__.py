from fastapi import APIRouter
from . import info, validate

router = APIRouter(prefix="/api/v1", tags=["v1"])

router.include_router(info.router)
router.include_router(validate.router)

