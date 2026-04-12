# file: app/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.simple_auth import get_db, User, Lesson, get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


# =========================
# ADMIN CHECK
# =========================

def require_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# =========================
# ADMIN STATS
# =========================

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    total_users = db.query(User).count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    total_lessons = db.query(Lesson).count()

    return {
        "total_users": total_users,
        "total_admins": total_admins,
        "total_lessons": total_lessons
    }


# =========================
# GET ALL USERS
# =========================

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]


# =========================
# DELETE USER
# =========================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}


# =========================
# GET ALL LESSONS
# =========================

@router.get("/lessons")
def get_lessons(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    lessons = db.query(Lesson).all()

    return [
        {
            "id": l.id,
            "title": l.title,
            "preview": l.content[:120],
            "user_id": l.user_id
        }
        for l in lessons
    ]