from sqlalchemy.orm import Session
from app.models.chat import ChatMessage
from datetime import datetime, timezone, timedelta


def get_ist_time():
    """Get current IST time"""
    utc_now = datetime.now(timezone.utc)
    ist_offset = timedelta(hours=5, minutes=30)
    ist_time = utc_now + ist_offset
    return ist_time.replace(tzinfo=None)


def save_message(db: Session, sender_id: int, receiver_id: int, message: str):
    chat = ChatMessage(
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message,
        created_at=get_ist_time()
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat