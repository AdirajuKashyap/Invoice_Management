from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.schemas.company import CompanyResponse, CompanyUpdate
from app.services.file_service import save_logo, save_signature, delete_file
from app.core.dependencies import get_db, get_current_user
from app.models.company import Company

router = APIRouter()


@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get current user's company details"""
    company = db.query(Company).filter(Company.id == user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/me", response_model=CompanyResponse)
def update_my_company(
    data: CompanyUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Update current user's company details"""
    company = db.query(Company).filter(Company.id == user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update fields
    for field, value in data.dict(exclude_unset=True).items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    return company


@router.post("/me/logo")
def upload_company_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Upload logo for company"""
    company = db.query(Company).filter(Company.id == user.company_id).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Delete old logo if exists
    if company.logo_path:
        delete_file(company.logo_path)
    
    # Save new logo
    file_path = save_logo(file, "company", company.id)
    company.logo_path = file_path
    db.commit()
    
    return {"message": "Company logo uploaded successfully", "logo_path": file_path}


@router.post("/me/signature")
def upload_company_signature(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Upload signature for company"""
    company = db.query(Company).filter(Company.id == user.company_id).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Delete old signature if exists
    if company.signature_path:
        delete_file(company.signature_path)
    
    # Save new signature
    file_path = save_signature(file, "company", company.id)
    company.signature_path = file_path
    db.commit()
    
    return {"message": "Company signature uploaded successfully", "signature_path": file_path}
