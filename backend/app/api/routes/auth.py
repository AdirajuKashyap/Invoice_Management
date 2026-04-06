from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.services.firebase_auth_service import firebase_login
from pydantic import BaseModel
from app.schemas.auth import CompleteProfileSchema, RegisterSchema, LoginSchema, UserBankDetails, UserResponse
from app.services.auth_service import register_user, login_user
from app.core.dependencies import get_db, get_current_user
from app.services.file_service import save_logo

router = APIRouter()


@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    return register_user(data, db)


@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    return login_user(data, db)


# @router.get("/me", response_model=UserResponse)
# def get_me(user=Depends(get_current_user)):
#     return user

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id
    }

class FirebaseLoginRequest(BaseModel):
    id_token: str


@router.post("/firebase-login")
def firebase_auth(data: FirebaseLoginRequest,
                  db: Session = Depends(get_db)):
    return firebase_login(data.id_token, db)

from app.models.company import Company
from app.core.dependencies import get_current_user

@router.post("/complete-profile")
def complete_profile(
    data: CompleteProfileSchema,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    user.role = data.role
    
    # Update user bank details if provided
    if data.bank_name:
        user.bank_name = data.bank_name
    if data.bank_account_number:
        user.bank_account_number = data.bank_account_number
    if data.bank_ifsc:
        user.bank_ifsc = data.bank_ifsc
    if data.bank_branch:
        user.bank_branch = data.bank_branch
    if data.upi_id:
        user.upi_id = data.upi_id

    company = db.query(Company).filter(Company.id == user.company_id).first()

    if company:
        company.name = data.company_name

    db.commit()

    return {
        "message": "Profile updated successfully"
    }

@router.put("/me/bank-details", response_model=UserResponse)
def update_bank_details(
    data: UserBankDetails,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Update user's personal bank account details"""
    user.bank_name = data.bank_name
    user.bank_account_number = data.bank_account_number
    user.bank_ifsc = data.bank_ifsc
    user.bank_branch = data.bank_branch
    user.upi_id = data.upi_id
    
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/profile-picture", response_model=UserResponse)
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Upload user profile picture"""
    file_path = save_logo(file, "user", user.id)
    
    # Delete old profile picture if exists
    if user.profile_picture:
        from app.services.file_service import delete_file
        delete_file(user.profile_picture)
    
    user.profile_picture = file_path
    db.commit()
    db.refresh(user)
    return user