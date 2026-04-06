from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.company import Company
from app.core.security import hash_password, verify_password, create_access_token


def register_user(data, db: Session):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    company = Company(name=data.company_name)
    db.add(company)
    db.commit()
    db.refresh(company)

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role=data.role,
        company_id=company.id
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "user_id": user.id,
        "role": user.role,
        "company_id": user.company_id
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


def login_user(data, db: Session):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "user_id": user.id,
        "role": user.role,
        "company_id": user.company_id
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }