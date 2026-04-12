# file: app/simple_auth.py

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request, Query
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from passlib.context import CryptContext
from jose import jwt
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from app.services.email_service import email_service


DATABASE_URL = "sqlite:///./users.db"
GOOGLE_CLIENT_ID = "61694655181-2a3215g3p00i048qqph34a3tj3gahqc3.apps.googleusercontent.com"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    photo = Column(String, nullable=True)
    role = Column(String, default="user")

    # New fields
    phone_number = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))


Base.metadata.create_all(bind=engine)


def create_admin():
    db = SessionLocal()

    admin_email = "admin@gmail.com"
    admin_password = "admin123"

    existing = db.query(User).filter(User.email == admin_email).first()

    if not existing:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        admin = User(
            name="Admin",
            email=admin_email,
            password=pwd_context.hash(admin_password),
            role="admin"
        )
        db.add(admin)
        db.commit()

    db.close()


create_admin()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone_number: str = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


class GoogleAuthRequest(BaseModel):
    credential: str


class CreateLessonRequest(BaseModel):
    title: str
    content: str


SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        scheme, token = auth_header.split()

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    verify_token = uuid.uuid4().hex

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        phone_number=data.phone_number,
        role="user",
        is_verified=False,
        verification_token=verify_token
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Send verification email
    email_service.send_verification_email(user.email, verify_token)

    token = create_token({"user_id": user.id, "role": user.role})

    return {
        "access_token": token,
        "user": {"name": user.name, "email": user.email, "role": user.role},
        "message": "User registered. Please verify your email."
    }


@router.get("/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        # Don't reveal if user exists for security
        return {"message": "If the account exists, a reset link has been sent."}

    reset_token = uuid.uuid4().hex
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=20)
    db.commit()

    email_service.send_reset_password_email(user.email, reset_token)

    return {"message": "If the account exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.reset_token == data.token,
        User.reset_token_expiry > datetime.utcnow()
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.password = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"message": "Password reset successfully"}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"user_id": user.id, "role": user.role})

    return {"access_token": token, "user": {"name": user.name, "email": user.email, "role": user.role}}


# 🔥 FIXED GOOGLE LOGIN (FINAL)
@router.post("/google")
def google_login(data: GoogleAuthRequest, db: Session = Depends(get_db)):

    idinfo = id_token.verify_oauth2_token(
        data.credential,
        requests.Request(),
        GOOGLE_CLIENT_ID
    )

    email = idinfo.get("email")
    name = idinfo.get("name")
    picture = idinfo.get("picture")

    if not email:
        raise HTTPException(status_code=401, detail="Google failed")

    # ALWAYS create or update clean user
    user = db.query(User).filter(User.email == email).first()

    if user:
        user.name = name
        user.photo = picture
    else:
        user = User(
            name=name,
            email=email,
            password="",
            photo=picture,
            role="user"
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_token({
        "user_id": user.id,
        "role": user.role
    })

    return {
        "access_token": token,
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "photo": user.photo
        }
    }


@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    os.makedirs("uploads", exist_ok=True)

    filepath = f"uploads/user_{user.id}.png"

    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    user.photo = filepath
    db.commit()

    return {"photo": filepath}