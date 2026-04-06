from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseModel


class BlockedUser(BaseModel):
    __tablename__ = "blocked_users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys to the users involved
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blocked_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Block timestamp
    blocked_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    blocked_user = relationship("User", foreign_keys=[blocked_user_id])
