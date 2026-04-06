from fastapi import UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import shutil
from pathlib import Path

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

LOGOS_DIR = UPLOAD_DIR / "logos"
SIGNATURES_DIR = UPLOAD_DIR / "signatures"
LOGOS_DIR.mkdir(exist_ok=True)
SIGNATURES_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file(file: UploadFile):
    """Validate uploaded file"""
    # Check file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")
    
    return ext

def save_logo(file: UploadFile, entity_type: str, entity_id: int):
    """Save logo file and return path"""
    ext = validate_file(file)
    
    # Create filename
    filename = f"{entity_type}_{entity_id}_logo{ext}"
    file_path = LOGOS_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return relative path for API/static serving
    return f"uploads/logos/{filename}"

def save_signature(file: UploadFile, entity_type: str, entity_id: int):
    """Save signature file and return path"""
    ext = validate_file(file)
    
    # Create filename
    filename = f"{entity_type}_{entity_id}_signature{ext}"
    file_path = SIGNATURES_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return relative path for API/static serving
    return f"uploads/signatures/{filename}"

def delete_file(file_path: str):
    """Delete a file if it exists"""
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
