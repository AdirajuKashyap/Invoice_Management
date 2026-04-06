from fastapi import APIRouter
from app.api.routes import auth, invoices, clients, expenses, companies, admin,ws,chat,notification,reactions,archive,block

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(ws.router, prefix="/ws", tags=["WS"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(notification.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reactions.router, prefix="/reactions", tags=["Reactions"])
api_router.include_router(archive.router, prefix="/archive", tags=["Archive"])
api_router.include_router(block.router, prefix="/block", tags=["Block"])


@api_router.get("/")
def test():
    return {"message": "API router working"}