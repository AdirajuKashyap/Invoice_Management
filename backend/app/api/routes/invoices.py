from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.invoice import InvoiceCreate, InvoiceResponse, PaymentVerification
from typing import List
from fastapi.responses import FileResponse
from app.services.invoice_service import create_payment_for_invoice
from app.services.payment_service import verify_payment
from app.services.invoice_service import generate_invoice_pdf_service
from app.services.invoice_service import (
    create_invoice,
    get_invoices,
    get_invoice_by_id,
    update_invoice_status,
    delete_invoice
)
from app.core.dependencies import get_db, get_current_user

router = APIRouter()


@router.post("/")
def create(data: InvoiceCreate,
           db: Session = Depends(get_db),
           user = Depends(get_current_user)):
    return create_invoice(data, db, user)


@router.get("/", response_model=List[InvoiceResponse])
def get_all(
    status: str = Query(None),
    skip: int = Query(0),
    limit: int = Query(10),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    return get_invoices(db, user, status, skip, limit)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_one(invoice_id: int,
            db: Session = Depends(get_db),
            user = Depends(get_current_user)):
    return get_invoice_by_id(invoice_id, db, user)


@router.put("/{invoice_id}/status")
def update_status(invoice_id: int,
                  status: str,
                  db: Session = Depends(get_db),
                  user = Depends(get_current_user)):
    return update_invoice_status(invoice_id, status, db, user)


@router.delete("/{invoice_id}")
def delete(invoice_id: int,
           db: Session = Depends(get_db),
           user = Depends(get_current_user)):
    return delete_invoice(invoice_id, db, user)

@router.get("/{invoice_id}/pdf")
def download_pdf(invoice_id: int,
                 db: Session = Depends(get_db),
                 user = Depends(get_current_user)):

    file_path = generate_invoice_pdf_service(invoice_id, db, user)

    if not file_path:
        return {"error": "Invoice not found"}

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"invoice_{invoice_id}.pdf"
    )


@router.post("/{invoice_id}/pay")
def create_payment(invoice_id: int,
                   db: Session = Depends(get_db),
                   user = Depends(get_current_user)):

    return create_payment_for_invoice(invoice_id, db, user)



@router.post("/verify-payment")
def verify(data: PaymentVerification,
           db: Session = Depends(get_db),
           user = Depends(get_current_user)):

    is_valid = verify_payment({
        'razorpay_order_id': data.razorpay_order_id,
        'razorpay_payment_id': data.razorpay_payment_id,
        'razorpay_signature': data.razorpay_signature
    })

    if not is_valid:
        return {"status": "failed"}

    invoice = get_invoice_by_id(data.invoice_id, db, user)

    if invoice:
        invoice.status = "paid"
        db.commit()

    return {"status": "success"}