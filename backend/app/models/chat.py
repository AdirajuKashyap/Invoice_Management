from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseModel


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))

    message = Column(String, nullable=False)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")