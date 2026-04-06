from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.models.base import BaseModel

class Client(BaseModel):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    
    # Additional client details
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    country = Column(String(100), default="India")
    gst_number = Column(String(50))
    pan_number = Column(String(20))
    
    # Bank account details (auto-generated for clients)
    bank_name = Column(String(100))
    bank_account_number = Column(String(50))
    bank_ifsc = Column(String(20))
    bank_branch = Column(String(100))
    upi_id = Column(String(50))
    
    # Logo and signature
    logo_path = Column(String(255))
    signature_path = Column(String(255))

    company_id = Column(Integer, ForeignKey("companies.id"))