from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=True)

    # Personal bank account details
    bank_name = Column(String(100))
    bank_account_number = Column(String(50))
    bank_ifsc = Column(String(20))
    bank_branch = Column(String(100))
    upi_id = Column(String(50))

    # Profile picture
    profile_picture = Column(String(255))

    company_id = Column(Integer, ForeignKey("companies.id"))

    # Online status tracking
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime, nullable=True)

    company = relationship("Company")