from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from datetime import datetime
from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String)
    message = Column(String)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)