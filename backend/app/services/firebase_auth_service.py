from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.company import Company
from app.core.security import create_access_token
from app.core.firebase_auth import verify_firebase_token


def firebase_login(id_token: str, db: Session):
    decoded = verify_firebase_token(id_token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    email = decoded.get("email")
    name = decoded.get("name", "User")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        company = Company(name=f"{name}'s Company")
        db.add(company)
        db.commit()
        db.refresh(company)

        user = User(
            name=name,
            email=email,
            password="firebase_auth",
            role=None, 
            company_id=company.id
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    is_profile_complete = user.role is not None

    token = create_access_token({
        "user_id": user.id,
        "role": user.role,
        "company_id": user.company_id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "profile_complete": is_profile_complete
    }