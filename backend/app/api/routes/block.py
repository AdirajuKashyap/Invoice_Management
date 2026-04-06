from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.blocked_user import BlockedUser
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class BlockRequest(BaseModel):
    user_id: int


@router.post("/block")
def block_user(
    block_data: BlockRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Check if user is already blocked
    existing_block = db.query(BlockedUser).filter(
        BlockedUser.user_id == user.id,
        BlockedUser.blocked_user_id == block_data.user_id
    ).first()
    
    if existing_block:
        return {"message": "User already blocked"}
    
    # Create new block entry
    new_block = BlockedUser(
        user_id=user.id,
        blocked_user_id=block_data.user_id
    )
    
    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    
    return {"message": "User blocked successfully", "block": new_block}


@router.delete("/block/{user_id}")
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Find and delete the block entry
    block = db.query(BlockedUser).filter(
        BlockedUser.user_id == user.id,
        BlockedUser.blocked_user_id == user_id
    ).first()
    
    if not block:
        return {"error": "User not found in blocked list"}
    
    db.delete(block)
    db.commit()
    
    return {"message": "User unblocked successfully"}


@router.get("/block")
def get_blocked_users(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Get all blocked users for the current user
    blocked_chats = db.query(BlockedUser).filter(
        BlockedUser.user_id == user.id
    ).all()
    
    result = []
    for block in blocked_chats:
        blocked_user = db.query(User).filter(User.id == block.blocked_user_id).first()
        if blocked_user:
            result.append({
                "id": block.id,
                "user_id": block.blocked_user_id,
                "name": blocked_user.name,
                "email": blocked_user.email,
                "blocked_at": block.blocked_at.isoformat() if block.blocked_at else None
            })
    
    return result


@router.get("/block/{user_id}/check")
def check_if_blocked(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check if a specific user is blocked
    block = db.query(BlockedUser).filter(
        BlockedUser.user_id == current_user.id,
        BlockedUser.blocked_user_id == user_id
    ).first()
    
    return {"is_blocked": block is not None}
