from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseModel


class MessageReaction(BaseModel):
    __tablename__ = "message_reactions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to the chat message
    message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False)
    
    # Foreign key to the user who reacted
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # The emoji reaction
    reaction = Column(String, nullable=False)
    
    # Timestamp of the reaction
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    message = relationship("ChatMessage", back_populates="reactions")
    user = relationship("User")
