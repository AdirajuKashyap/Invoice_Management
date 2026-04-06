from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.archived_chat import ArchivedChat
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class ArchiveRequest(BaseModel):
    user_id: int


@router.post("/archive")
def archive_chat(
    archive_data: ArchiveRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Check if chat is already archived
    existing_archive = db.query(ArchivedChat).filter(
        ArchivedChat.user_id == user.id,
        ArchivedChat.archived_user_id == archive_data.user_id
    ).first()
    
    if existing_archive:
        return {"message": "Chat already archived"}
    
    # Create new archive entry
    new_archive = ArchivedChat(
        user_id=user.id,
        archived_user_id=archive_data.user_id
    )
    
    db.add(new_archive)
    db.commit()
    db.refresh(new_archive)
    
    return {"message": "Chat archived successfully", "archive": new_archive}


@router.delete("/archive/{user_id}")
def unarchive_chat(
    user_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Find and delete the archive entry
    archive = db.query(ArchivedChat).filter(
        ArchivedChat.user_id == user.id,
        ArchivedChat.archived_user_id == user_id
    ).first()
    
    if not archive:
        return {"error": "Chat not found in archives"}
    
    db.delete(archive)
    db.commit()
    
    return {"message": "Chat unarchived successfully"}


@router.get("/archive")
def get_archived_chats(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Get all archived chats for the user
    archived_chats = db.query(ArchivedChat).filter(
        ArchivedChat.user_id == user.id
    ).all()
    
    result = []
    for archive in archived_chats:
        archived_user = db.query(User).filter(User.id == archive.archived_user_id).first()
        if archived_user:
            result.append({
                "id": archive.id,
                "user_id": archive.archived_user_id,
                "name": archived_user.name,
                "email": archived_user.email,
                "archived_at": archive.archived_at.isoformat() if archive.archived_at else None
            })
    
    return result


@router.get("/archive/{user_id}/check")
def check_if_archived(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check if a specific chat is archived
    archive = db.query(ArchivedChat).filter(
        ArchivedChat.user_id == current_user.id,
        ArchivedChat.archived_user_id == user_id
    ).first()
    
    return {"is_archived": archive is not None}
