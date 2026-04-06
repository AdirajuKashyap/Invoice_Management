from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Text
from app.models.base import BaseModel

class Expense(BaseModel):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String, nullable=False)
    expense_date = Column(DateTime, nullable=False)
    
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
