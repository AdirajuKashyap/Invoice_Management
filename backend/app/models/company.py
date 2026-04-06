from sqlalchemy import Column, Integer, String
from app.models.base import BaseModel

class Company(BaseModel):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    plan = Column(String, default="free")
    
    # Contact information
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(String(255))
    city = Column(String(50))
    state = Column(String(50))
    pincode = Column(String(10))
    
    # Business bank account details
    bank_name = Column(String(100))
    bank_account_number = Column(String(50))
    bank_ifsc = Column(String(20))
    bank_branch = Column(String(100))
    upi_id = Column(String(50))
    
    # Logo and signature for company
    logo_path = Column(String(255))
    signature_path = Column(String(255))