from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.dependencies import get_db, get_current_user
from app.models.chat import ChatMessage
from app.models.user import User
from app.models.message_reaction import MessageReaction
from app.models.archived_chat import ArchivedChat
from app.models.blocked_user import BlockedUser
from pydantic import BaseModel

router = APIRouter()


@router.get("/users")
def get_chat_users(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if user.role == "admin":
        users = db.query(User).all()
    else:
        users = db.query(User).filter(User.role == "admin").all()

    # Get archived user IDs for this user
    archived_chats = db.query(ArchivedChat).filter(ArchivedChat.user_id == user.id).all()
    archived_user_ids = [arch.archived_user_id for arch in archived_chats]

    # Get blocked user IDs for this user
    blocked_chats = db.query(BlockedUser).filter(BlockedUser.user_id == user.id).all()
    blocked_user_ids = [block.blocked_user_id for block in blocked_chats]

    # Include online status and last seen, but exclude archived and blocked chats
    result = []
    for u in users:
        if u.id not in archived_user_ids and u.id not in blocked_user_ids and u.id != user.id:
            result.append({
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "is_online": u.is_online,
                "last_seen": u.last_seen.isoformat() if u.last_seen else None
            })
    
    return result

@router.get("/{user_id}")
def get_chat(user_id: int,
             db: Session = Depends(get_db),
             current_user = Depends(get_current_user)):

    messages = db.query(ChatMessage).options(
        joinedload(ChatMessage.reactions)
    ).filter(
        ((ChatMessage.sender_id == current_user.id) & (ChatMessage.receiver_id == user_id)) |
        ((ChatMessage.sender_id == user_id) & (ChatMessage.receiver_id == current_user.id))
    ).order_by(ChatMessage.created_at).all()

    # Format messages with reactions
    result = []
    for message in messages:
        reactions_data = {}
        for reaction in message.reactions:
            if reaction.reaction not in reactions_data:
                reactions_data[reaction.reaction] = []
            reactions_data[reaction.reaction].append({
                "user_id": reaction.user_id,
                "user_name": reaction.user.name if reaction.user else "Unknown"
            })
        
        result.append({
            "id": message.id,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "message": message.message,
            "is_read": message.is_read,
            "created_at": message.created_at.isoformat() if message.created_at else None,
            "reactions": reactions_data
        })

    return result


class MessageEditRequest(BaseModel):
    message: str


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only allow sender to delete their own messages
    if message.sender_id != user.id:
        raise HTTPException(status_code=403, detail="Cannot delete other user's messages")
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}


@router.put("/messages/{message_id}")
def edit_message(
    message_id: int,
    message_data: MessageEditRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only allow sender to edit their own messages
    if message.sender_id != user.id:
        raise HTTPException(status_code=403, detail="Cannot edit other user's messages")
    
    message.message = message_data.message
    db.commit()
    db.refresh(message)
    
    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "receiver_id": message.receiver_id,
        "message": message.message,
        "is_read": message.is_read,
        "created_at": message.created_at.isoformat() if message.created_at else None
    }