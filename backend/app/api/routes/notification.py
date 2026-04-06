from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.notification import Notification

router = APIRouter()

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    return db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(Notification.created_at.desc()).all()


@router.post("/read/{id}")
def mark_as_read(
    id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == user.id
    ).first()

    if notif:
        notif.is_read = True
        db.commit()

    return {"message": "updated"}