from .auth_routes import router as auth_router
from .project_routes import router as project_router
from .document_routes import router as document_router

__all__ = ["auth_router", "project_router", "document_router"]
