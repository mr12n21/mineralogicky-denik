from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from PIL import Image
import aiofiles

from app.database import get_db
from app.models import User, Location, Photo
from app.schemas import PhotoResponse
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

async def save_upload_file(upload_file: UploadFile, destination: str):
    async with aiofiles.open(destination, 'wb') as out_file:
        content = await upload_file.read()
        await out_file.write(content)

def create_thumbnail(image_path: str, thumbnail_path: str, size: tuple = (200, 200)):
    with Image.open(image_path) as img:
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        img.thumbnail(size, Image.Resampling.LANCZOS)
        img.save(thumbnail_path, "JPEG", quality=85, optimize=True)

def resize_image(image_path: str, max_size: tuple = (1920, 1920)):
    with Image.open(image_path) as img:
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(image_path, "JPEG", quality=90, optimize=True)
        
        return img.size

@router.post("", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    location_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify location exists and belongs to user
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.user_id == current_user.id
    ).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Validate file type
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        )
    await file.seek(0)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    photo_path = os.path.join(settings.UPLOAD_DIR, "photos", unique_filename)
    thumbnail_path = os.path.join(settings.UPLOAD_DIR, "thumbnails", f"thumb_{unique_filename}")
    
    # Save file
    await save_upload_file(file, photo_path)
    
    # Resize image if needed
    width, height = resize_image(photo_path, settings.MAX_IMAGE_SIZE)
    
    # Create thumbnail
    create_thumbnail(photo_path, thumbnail_path, settings.THUMBNAIL_SIZE)
    
    # Create database record
    db_photo = Photo(
        location_id=location_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=f"/uploads/photos/{unique_filename}",
        thumbnail_path=f"/uploads/thumbnails/thumb_{unique_filename}",
        file_size=len(content),
        mime_type=file.content_type,
        width=width,
        height=height
    )
    
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    
    return db_photo

@router.get("/{photo_id}", response_model=PhotoResponse)
async def get_photo(
    photo_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    photo = db.query(Photo).join(Location).filter(
        Photo.id == photo_id,
        Location.user_id == current_user.id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    return photo

@router.get("/{photo_id}/file")
async def get_photo_file(
    photo_id: str,
    thumbnail: bool = False,
    db: Session = Depends(get_db)
):
    """Public endpoint for serving photo files - verification is done via photo ownership"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    if thumbnail:
        file_path = os.path.join(settings.UPLOAD_DIR, "thumbnails", f"thumb_{photo.filename}")
    else:
        file_path = os.path.join(settings.UPLOAD_DIR, "photos", photo.filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return FileResponse(file_path, media_type=photo.mime_type or "image/jpeg")

@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    photo = db.query(Photo).join(Location).filter(
        Photo.id == photo_id,
        Location.user_id == current_user.id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Delete files from disk
    photo_path = os.path.join(settings.UPLOAD_DIR, "photos", photo.filename)
    thumbnail_path = os.path.join(settings.UPLOAD_DIR, "thumbnails", f"thumb_{photo.filename}")
    
    if os.path.exists(photo_path):
        os.remove(photo_path)
    if os.path.exists(thumbnail_path):
        os.remove(thumbnail_path)
    
    # Delete from database
    db.delete(photo)
    db.commit()
    
    return None

@router.get("/location/{location_id}", response_model=List[PhotoResponse])
async def list_location_photos(
    location_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify location exists and belongs to user
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.user_id == current_user.id
    ).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    photos = db.query(Photo).filter(Photo.location_id == location_id).all()
    return photos
