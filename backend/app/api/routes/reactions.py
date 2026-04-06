from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.message_reaction import MessageReaction
from app.models.chat import ChatMessage
from pydantic import BaseModel

router = APIRouter()


class ReactionRequest(BaseModel):
    message_id: int
    reaction: str


@router.post("/reactions")
def add_reaction(
    reaction_data: ReactionRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Check if message exists and user has access
    message = db.query(ChatMessage).filter(ChatMessage.id == reaction_data.message_id).first()
    if not message:
        return {"error": "Message not found"}
    
    # Check if user is part of the conversation
    if message.sender_id != user.id and message.receiver_id != user.id:
        return {"error": "Access denied"}
    
    # Check if user already reacted to this message
    existing_reaction = db.query(MessageReaction).filter(
        MessageReaction.message_id == reaction_data.message_id,
        MessageReaction.user_id == user.id
    ).first()
    
    if existing_reaction:
        # Update existing reaction
        existing_reaction.reaction = reaction_data.reaction
        db.commit()
        db.refresh(existing_reaction)
        return {"message": "Reaction updated", "reaction": existing_reaction}
    else:
        # Add new reaction
        new_reaction = MessageReaction(
            message_id=reaction_data.message_id,
            user_id=user.id,
            reaction=reaction_data.reaction
        )
        db.add(new_reaction)
        db.commit()
        db.refresh(new_reaction)
        return {"message": "Reaction added", "reaction": new_reaction}


@router.delete("/reactions/{message_id}")
def remove_reaction(
    message_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Find and delete the reaction
    reaction = db.query(MessageReaction).filter(
        MessageReaction.message_id == message_id,
        MessageReaction.user_id == user.id
    ).first()
    
    if not reaction:
        return {"error": "Reaction not found"}
    
    db.delete(reaction)
    db.commit()
    return {"message": "Reaction removed"}


@router.get("/reactions/{message_id}")
def get_message_reactions(
    message_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Check if user has access to this message
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        return {"error": "Message not found"}
    
    if message.sender_id != user.id and message.receiver_id != user.id:
        return {"error": "Access denied"}
    
    # Get all reactions for this message
    reactions = db.query(MessageReaction).filter(
        MessageReaction.message_id == message_id
    ).all()
    
    # Group reactions by emoji and count
    reaction_counts = {}
    for reaction in reactions:
        if reaction.reaction not in reaction_counts:
            reaction_counts[reaction.reaction] = []
        reaction_counts[reaction.reaction].append({
            "id": reaction.id,
            "user_id": reaction.user_id,
            "user_name": reaction.user.name if reaction.user else "Unknown"
        })
    
    return {
        "message_id": message_id,
        "reactions": reaction_counts
    }
