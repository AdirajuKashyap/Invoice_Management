from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User

security = HTTPBearer(auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ):
#     try:
#         token = credentials.credentials
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

#         user_id: int = payload.get("user_id")
#         company_id: int = payload.get("company_id")

#         if user_id is None:
#             raise HTTPException(status_code=401, detail="Invalid token")

#         user = db.query(User).filter(User.id == user_id).first()

#         if user is None:
#             raise HTTPException(status_code=401, detail="User not found")

#         if user.company_id != company_id:
#             raise HTTPException(status_code=403, detail="Company mismatch")

#         return user

#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        user_id = payload.get("user_id")
        company_id = payload.get("company_id")
        role = payload.get("role")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        if role != "admin":
            if company_id and user.company_id != company_id:
                raise HTTPException(status_code=403, detail="Company mismatch")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_roles(*roles: str):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return user
    return role_checker