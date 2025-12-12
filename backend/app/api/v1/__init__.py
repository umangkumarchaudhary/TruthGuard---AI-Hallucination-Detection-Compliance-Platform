from fastapi import APIRouter
from . import info, validate, compliance, policies, audit

router = APIRouter(prefix="/api/v1", tags=["v1"])

router.include_router(info.router)
router.include_router(validate.router)
router.include_router(compliance.router)
router.include_router(policies.router)
router.include_router(audit.router, prefix="/audit")

