# backend/app/routes/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app import schemas, crud, models
from app.database import get_db
from app.auth import (
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
    get_password_hash
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)




# === REGISTER ===
@router.post("/register")
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Registration attempt → username: {user.username}, email: {user.email}")

    # Check username
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check email
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password + create user
    hashed_password = get_password_hash(user.password)
    new_user = schemas.UserCreate(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    created_user = crud.create_user(db=db, user=new_user)

    # Commit
    db.commit()
    db.refresh(created_user)

    # Generate token
    access_token = create_access_token(
        data={"sub": created_user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    logger.info(f"User registered successfully → ID: {created_user.id}")

    return {
        "message": "User registered successfully",
        "user": {
            "id": created_user.id,
            "username": created_user.username,
            "email": created_user.email,
            "created_at": created_user.created_at.isoformat() if created_user.created_at else None
        },
        "access_token": access_token,
        "token_type": "bearer"
    }


# === LOGIN ===
@router.post("/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt → username: {user_credentials.username}")

    user = crud.get_user_by_username(db, user_credentials.username)
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        logger.warning("Login failed → invalid username or password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    logger.info(f"Login successful → {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}


# === PROTECTED ROUTES ===
@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/test")
async def auth_test():
    return {"message": "Auth routes are working perfectly!"}


# === HEALTH CHECK ===
@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}
