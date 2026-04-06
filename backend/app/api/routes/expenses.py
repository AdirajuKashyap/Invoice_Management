from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.expense import Expense
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

router = APIRouter()

class ExpenseCreate(BaseModel):
    title: str
    description: str = None
    amount: float
    category: str
    expense_date: datetime

class ExpenseResponse(BaseModel):
    id: int
    title: str
    description: str = None
    amount: float
    category: str
    expense_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all expenses for the current user's company"""
    expenses = db.query(Expense).filter(
        Expense.company_id == current_user.company_id
    ).order_by(Expense.expense_date.desc()).all()
    return expenses

@router.post("/", response_model=ExpenseResponse)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new expense"""
    expense = Expense(
        title=data.title,
        description=data.description,
        amount=Decimal(str(data.amount)),
        category=data.category,
        expense_date=data.expense_date,
        company_id=current_user.company_id,
        user_id=current_user.id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/stats")
def get_expense_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expense statistics"""
    from sqlalchemy import func
    
    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.company_id == current_user.company_id
    ).scalar() or 0
    
    expense_count = db.query(Expense).filter(
        Expense.company_id == current_user.company_id
    ).count()
    
    # Category breakdown
    category_breakdown = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter(
        Expense.company_id == current_user.company_id
    ).group_by(Expense.category).all()
    
    return {
        "total_amount": float(total_expenses),
        "expense_count": expense_count,
        "category_breakdown": [
            {"category": cat, "total": float(total), "count": count}
            for cat, total, count in category_breakdown
        ]
    }

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an expense"""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.company_id == current_user.company_id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}
