from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.dependencies import get_db, get_current_user

app = FastAPI(title="Invoice Management API")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (logos and signatures)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Stats for dashboard - filtered by user's company"""
    from sqlalchemy import text
    
    invoice_count = db.execute(text("SELECT COUNT(*) FROM invoices WHERE company_id = :cid"), {"cid": user.company_id}).scalar() or 0
    client_count = db.execute(text("SELECT COUNT(*) FROM clients WHERE company_id = :cid"), {"cid": user.company_id}).scalar() or 0
    paid_count = db.execute(text("SELECT COUNT(*) FROM invoices WHERE status='paid' AND company_id = :cid"), {"cid": user.company_id}).scalar() or 0
    pending = db.execute(text("SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status != 'paid' AND company_id = :cid"), {"cid": user.company_id}).scalar() or 0
    
    return {
        "totalInvoices": invoice_count,
        "totalClients": client_count,
        "paidInvoices": paid_count,
        "pendingAmount": float(pending)
    }

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "DB connected successfully"}