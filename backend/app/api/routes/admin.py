from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db
from app.core.firebase_auth import verify_firebase_token
from app.models.user import User
from app.models.company import Company
from app.models.invoice import Invoice
from app.schemas.auth import UserResponse
from app.core.security import verify_password, create_access_token
from pydantic import BaseModel
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter(tags=["admin"])

ALGORITHM = "HS256"

class AdminLoginSchema(BaseModel):
    email: str
    password: str


@router.post("/login")
def admin_login(data: AdminLoginSchema, db: Session = Depends(get_db)):
    """Admin login with email/password - only one admin allowed"""
    
    user = db.query(User).filter(User.email == data.email, User.role == "admin").first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    # Check password
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    token = create_access_token(data={"user_id": user.id, "role": "admin", "company_id": None})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "email": user.email,
        "name": user.name,
        "role": user.role
    }


@router.post("/setup")
def setup_admin(data: AdminLoginSchema, db: Session = Depends(get_db)):
    """Setup or reset admin password - only works if no admin exists or for existing admin"""
    from app.core.security import hash_password
    
    # Check if any admin exists
    existing_admin = db.query(User).filter(User.role == "admin").first()
    
    if existing_admin and existing_admin.email != data.email:
        raise HTTPException(status_code=403, detail="Admin already exists")
    
    if existing_admin:
        # Update password
        existing_admin.password = hash_password(data.password)
        db.commit()
        return {"message": "Admin password updated"}
    else:
        # Create new admin
        new_admin = User(
            email=data.email,
            name="System Admin",
            password=hash_password(data.password),
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        return {"message": "Admin created"}


from jose import jwt, JWTError
from app.core.config import settings

ALGORITHM = "HS256"

def get_admin_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        role = payload.get("role")
        
        if user_id is None or role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized as admin")
            
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Check if user exists and is admin
    user = db.query(User).filter(User.id == user_id, User.role == "admin").first()
    if not user:
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    
    return user


@router.post("/auth/verify")
def verify_admin(authorization: str = None, db: Session = Depends(get_db)):
    """Verify Firebase token from header and check if user is admin"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Authorization header required")
    
    token = authorization.replace("Bearer ", "")
    decoded = verify_firebase_token(token)
    
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    email = decoded.get("email")
    name = decoded.get("name", email.split('@')[0])
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Auto-create user as admin for first login
        user = User(
            email=email,
            name=name,
            password="firebase_auth",
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {
        "email": user.email,
        "role": user.role if user.role else "user",
        "name": user.name
    }


@router.get("/users", response_model=List[dict])
def get_all_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get all users (admin only)"""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role or "user",
            "company": u.company.name if u.company else None,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]


@router.get("/companies", response_model=List[dict])
def get_all_companies(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get all companies (admin only)"""
    companies = db.query(Company).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "plan": c.plan,
            "email": c.email,
            "phone": c.phone,
            "address": c.address,
            "city": c.city,
            "state": c.state,
            "logo_path": c.logo_path,
            "bank_name": c.bank_name,
            "upi_id": c.upi_id,
            "invoices_count": db.query(Invoice).filter(Invoice.company_id == c.id).count()
        }
        for c in companies
    ]


@router.put("/companies/{company_id}")
def update_company(
    company_id: int,
    company_data: dict,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update company details (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update allowed fields
    allowed_fields = ['name', 'email', 'phone', 'address', 'city', 'state', 'plan', 'bank_name', 'upi_id']
    for field in allowed_fields:
        if field in company_data:
            setattr(company, field, company_data[field])
    
    db.commit()
    db.refresh(company)
    
    return {
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "phone": company.phone,
        "address": company.address,
        "city": company.city,
        "state": company.state,
        "plan": company.plan,
        "bank_name": company.bank_name,
        "upi_id": company.upi_id
    }


@router.get("/invoices", response_model=List[dict])
def get_all_invoices(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get all invoices across all companies (admin only)"""
    invoices = db.query(Invoice).all()
    return [
        {
            "id": inv.id,
            "invoice_number": f"INV-{inv.id:04d}",
            "client_name": inv.client.name if inv.client else None,
            "company_name": inv.company.name if inv.company else None,
            "total": float(inv.total) if inv.total else 0,
            "status": inv.status,
            "created_at": inv.created_at.isoformat() if inv.created_at else None
        }
        for inv in invoices
    ]


@router.get("/stats")
def get_admin_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get admin dashboard statistics"""
    total_users = db.query(User).count()
    total_companies = db.query(Company).count()
    total_invoices = db.query(Invoice).count()
    
    # Calculate total revenue
    from sqlalchemy import func
    total_revenue = db.query(func.sum(Invoice.total)).scalar() or 0
    
    pending_invoices = db.query(Invoice).filter(
        Invoice.status.in_(["pending", "sent"])
    ).count()
    
    return {
        "total_users": total_users,
        "total_companies": total_companies,
        "total_invoices": total_invoices,
        "total_revenue": float(total_revenue),
        "pending_invoices": pending_invoices
    }
