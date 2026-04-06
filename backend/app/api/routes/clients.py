from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.schemas.client import ClientCreate, ClientResponse
from app.services.client_service import create_client, get_clients, delete_client, get_client_by_id
from app.services.file_service import save_logo, save_signature, delete_file
from app.core.dependencies import get_db, get_current_user
from app.models.client import Client

router = APIRouter()


@router.post("/", response_model=ClientResponse)
def create(data: ClientCreate,
           db: Session = Depends(get_db),
           user = Depends(get_current_user)):
    return create_client(data, db, user)


@router.get("/", response_model=list[ClientResponse])
def get_all(db: Session = Depends(get_db),
            user = Depends(get_current_user)):
    return get_clients(db, user)


@router.delete("/{client_id}")
def delete(client_id: int,
           db: Session = Depends(get_db),
           user = Depends(get_current_user)):
    client = delete_client(client_id, db, user)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}


@router.post("/{client_id}/logo")
def upload_logo(
    client_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Upload logo for a client"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == user.company_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Delete old logo if exists
    if client.logo_path:
        delete_file(client.logo_path)
    
    # Save new logo
    file_path = save_logo(file, "client", client_id)
    client.logo_path = file_path
    db.commit()
    
    return {"message": "Logo uploaded successfully", "logo_path": file_path}


@router.post("/{client_id}/signature")
def upload_signature(
    client_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Upload signature for a client"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == user.company_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Delete old signature if exists
    if client.signature_path:
        delete_file(client.signature_path)
    
    # Save new signature
    file_path = save_signature(file, "client", client_id)
    client.signature_path = file_path
    db.commit()
    
    return {"message": "Signature uploaded successfully", "signature_path": file_path}