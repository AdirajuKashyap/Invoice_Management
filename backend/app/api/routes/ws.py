from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.chat_service import save_message
from app.core.database import SessionLocal
from app.models.notification import Notification
from app.models.user import User
from app.websocket import manager
from winotify import Notification as WinNotification
from datetime import datetime, timezone, timedelta
import asyncio

def get_ist_time():
    """Get current IST time"""
    utc_now = datetime.now(timezone.utc)
    ist_offset = timedelta(hours=5, minutes=30)
    ist_time = utc_now + ist_offset
    return ist_time.replace(tzinfo=None)

router = APIRouter()

def show_desktop_notification(title: str, message: str):
    """Show Windows desktop notification"""
    try:
        toast = WinNotification(
            app_id="Invoice Management System",
            title=title,
            msg=message,
            icon=r"C:\Windows\System32\imageres.dll"
        )
        toast.build().show()
    except Exception as e:
        print(f"Failed to show notification: {e}")

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    
    # Set user as online
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_online = True
            user.last_seen = get_ist_time()
            db.commit()
    except Exception as e:
        print(f"Error setting user online: {e}")
    finally:
        db.close()

    try:
        while True:
            data = await websocket.receive_json()

            db = SessionLocal()

            chat = save_message(
                db,
                sender_id=user_id,
                receiver_id=data["receiver_id"],
                message=data["message"]
            )

            notification = Notification(
                user_id=data["receiver_id"],
                title="New Message",
                message="You have a new message",
                is_read=False
            )

            db.add(notification)
            db.commit()
            db.refresh(notification)

            # Extract chat data before closing session
            chat_message = chat.message
            chat_timestamp = str(chat.created_at)

            # Get sender name for notification
            sender = db.query(User).filter(User.id == user_id).first()
            sender_name = sender.name if sender else "Someone"

            db.close()

            # Show Windows desktop notification
            show_desktop_notification(
                f"New message from {sender_name}",
                chat_message[:50] + "..." if len(chat_message) > 50 else chat_message
            )

            await manager.send_personal(
                data["receiver_id"],
                {
                    "type": "chat",
                    "sender_id": user_id,
                    "message": chat_message,
                    "timestamp": chat_timestamp
                }
            )

            await manager.send_personal(
                data["receiver_id"],
                {
                    "type": "notification",
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "is_read": notification.is_read
                }
            )

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        
        # Set user as offline
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.is_online = False
                user.last_seen = get_ist_time()
                db.commit()
        except Exception as e:
            print(f"Error setting user offline: {e}")
        finally:
            db.close()