from sqlalchemy.orm import Session, joinedload
from app.models.invoice import Invoice, InvoiceItem
from app.models.client import Client
from app.models.company import Company
from app.utils.pdf_generator import generate_invoice_pdf
from app.services.payment_service import create_order

def create_invoice(data, db: Session, user):
    subtotal = 0
    total_tax = 0

    invoice = Invoice(
        company_id=user.company_id,
        client_id=data.client_id,
        status="draft"
    )

    db.add(invoice)
    db.flush()

    for item in data.items:
        item_total = item.quantity * item.price
        item_tax = item_total * (item.tax / 100) if item.tax else 0

        subtotal += item_total
        total_tax += item_tax

        invoice_item = InvoiceItem(
            invoice_id=invoice.id,
            product=item.product,
            quantity=item.quantity,
            price=item.price,
            tax=item.tax or 0,
            total=item_total + item_tax
        )

        db.add(invoice_item)

    invoice.subtotal = subtotal
    invoice.tax = total_tax
    invoice.total = subtotal + total_tax

    db.commit()
    db.refresh(invoice)

    return invoice



def get_invoices(db: Session, user, status: str = None, skip: int = 0, limit: int = 10):
    query = db.query(Invoice).options(
        joinedload(Invoice.client)
    ).filter(
        Invoice.company_id == user.company_id
    )

    if status:
        query = query.filter(Invoice.status == status)

    invoices = query.offset(skip).limit(limit).all()
    
    # Add client_name to each invoice for response
    for invoice in invoices:
        invoice.client_name = invoice.client.name if invoice.client else None
    
    return invoices


def get_invoice_by_id(invoice_id: int, db: Session, user):
    return db.query(Invoice).options(
        joinedload(Invoice.client),
        joinedload(Invoice.items)
    ).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == user.company_id
    ).first()


def update_invoice_status(invoice_id: int, status: str, db: Session, user):
    invoice = get_invoice_by_id(invoice_id, db, user)

    if not invoice:
        return None

    invoice.status = status
    db.commit()
    db.refresh(invoice)

    return invoice


def delete_invoice(invoice_id: int, db: Session, user):
    invoice = get_invoice_by_id(invoice_id, db, user)

    if not invoice:
        return None

    db.delete(invoice)
    db.commit()

    return {"message": "Invoice deleted"}

def generate_invoice_pdf_service(invoice_id: int, db: Session, user):
    invoice = get_invoice_by_id(invoice_id, db, user)

    if not invoice:
        return None

    # Fetch company for logo and signature
    company = db.query(Company).filter(Company.id == user.company_id).first()

    file_path = generate_invoice_pdf(invoice, company, user)

    return file_path




def create_payment_for_invoice(invoice_id: int, db, user):
    invoice = get_invoice_by_id(invoice_id, db, user)

    if not invoice:
        return None

    amount = int(invoice.total * 100)

    order = create_order(amount)

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"]
    }