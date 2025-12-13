from fastapi import APIRouter
from . import info, validate, compliance, policies, audit, ai_test

router = APIRouter(prefix="/api/v1", tags=["v1"])

router.include_router(info.router)
router.include_router(validate.router)
router.include_router(compliance.router)
router.include_router(policies.router)
router.include_router(audit.router, prefix="/audit")
router.include_router(ai_test.router, prefix="/ai-test")

