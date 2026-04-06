from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class InvoiceItemCreate(BaseModel):
    product: str
    quantity: int
    price: float
    tax: Optional[float] = 0


class InvoiceCreate(BaseModel):
    client_id: int
    items: List[InvoiceItemCreate]


class InvoiceItemResponse(BaseModel):
    id: int
    product: str
    quantity: int
    price: float
    tax: float
    total: float

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    id: int
    client_id: int
    client_name: Optional[str] = None
    status: str
    subtotal: float
    tax: float
    total: float
    created_at: datetime

    items: List[InvoiceItemResponse]

    class Config:
        from_attributes = True


class PaymentVerification(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    invoice_id: int