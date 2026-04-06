from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseModel


class ArchivedChat(BaseModel):
    __tablename__ = "archived_chats"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys to the users involved in the chat
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    archived_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Archive timestamp
    archived_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    archived_user = relationship("User", foreign_keys=[archived_user_id])
