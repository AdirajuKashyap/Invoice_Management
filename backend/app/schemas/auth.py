from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    company_name: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CompleteProfileSchema(BaseModel):
    company_name: str
    role: str
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_branch: Optional[str] = None
    upi_id: Optional[str] = None

class UserBankDetails(BaseModel):
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_branch: Optional[str] = None
    upi_id: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: Optional[str] = None
    profile_picture: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_branch: Optional[str] = None
    upi_id: Optional[str] = None
    company_id: int

    class Config:
        from_attributes = True