from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Invoice(BaseModel):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))

    status = Column(String, default="draft")

    subtotal = Column(Float, default=0)
    tax = Column(Float, default=0)
    total = Column(Float, default=0)

    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete")
    client = relationship("Client")
    company = relationship("Company")


class InvoiceItem(BaseModel):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))

    product = Column(String)
    quantity = Column(Integer)
    price = Column(Float)
    tax = Column(Float)

    total = Column(Float)

    invoice = relationship("Invoice", back_populates="items")