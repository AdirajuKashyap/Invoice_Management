from sqlalchemy.orm import Session
from app.models.client import Client
import random

def generate_random_bank_details():
    """Generate random bank account details for clients"""
    banks = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", 
             "Bank of Baroda", "Canara Bank", "Union Bank", "Bank of India", "Indian Bank"]
    
    bank_name = random.choice(banks)
    account_number = ''.join([str(random.randint(0, 9)) for _ in range(12)])
    ifsc_code = f"SBIN{random.randint(10000, 99999)}" if "SBI" in bank_name else f"HDFC{random.randint(10000, 99999)}"
    branch = f"Branch {random.randint(1, 999)}"
    upi = f"client{random.randint(1000, 9999)}@upi"
    
    return {
        "bank_name": bank_name,
        "bank_account_number": account_number,
        "bank_ifsc": ifsc_code,
        "bank_branch": branch,
        "upi_id": upi
    }

def create_client(data, db: Session, user):
    # Generate random bank details for the client
    bank_details = generate_random_bank_details()
    
    client = Client(
        name=data.name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        country=data.country or "India",
        gst_number=data.gst_number,
        pan_number=data.pan_number,
        # Auto-generated bank details
        bank_name=bank_details["bank_name"],
        bank_account_number=bank_details["bank_account_number"],
        bank_ifsc=bank_details["bank_ifsc"],
        bank_branch=bank_details["bank_branch"],
        upi_id=bank_details["upi_id"],
        company_id=user.company_id
    )

    db.add(client)
    db.commit()
    db.refresh(client)

    return client


def get_clients(db: Session, user):
    return db.query(Client).filter(
        Client.company_id == user.company_id
    ).all()


def get_client_by_id(client_id: int, db: Session, user):
    """Get a specific client by ID"""
    return db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == user.company_id
    ).first()


def delete_client(client_id: int, db: Session, user):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == user.company_id
    ).first()
    
    if not client:
        return None
    
    db.delete(client)
    db.commit()
    return client