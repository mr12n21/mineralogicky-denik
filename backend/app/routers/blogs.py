from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Location, BlogEntry
from app.schemas import BlogEntryCreate, BlogEntryUpdate, BlogEntryResponse
from app.auth import get_current_user

router = APIRouter()

@router.post("", response_model=BlogEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_blog_entry(
    blog: BlogEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify location exists and belongs to user
    location = db.query(Location).filter(
        Location.id == blog.location_id,
        Location.user_id == current_user.id
    ).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    db_blog = BlogEntry(
        location_id=blog.location_id,
        title=blog.title,
        content=blog.content,
        content_html=blog.content_html
    )
    
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    
    return db_blog

@router.get("/{blog_id}", response_model=BlogEntryResponse)
async def get_blog_entry(
    blog_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(BlogEntry).join(Location).filter(
        BlogEntry.id == blog_id,
        Location.user_id == current_user.id
    ).first()
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog entry not found"
        )
    
    return blog

@router.put("/{blog_id}", response_model=BlogEntryResponse)
async def update_blog_entry(
    blog_id: str,
    blog_update: BlogEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_blog = db.query(BlogEntry).join(Location).filter(
        BlogEntry.id == blog_id,
        Location.user_id == current_user.id
    ).first()
    
    if not db_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog entry not found"
        )
    
    update_data = blog_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_blog, field, value)
    
    db.commit()
    db.refresh(db_blog)
    
    return db_blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_entry(
    blog_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(BlogEntry).join(Location).filter(
        BlogEntry.id == blog_id,
        Location.user_id == current_user.id
    ).first()
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog entry not found"
        )
    
    db.delete(blog)
    db.commit()
    
    return None

@router.get("/location/{location_id}", response_model=List[BlogEntryResponse])
async def list_location_blogs(
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
    
    blogs = db.query(BlogEntry).filter(
        BlogEntry.location_id == location_id
    ).order_by(BlogEntry.created_at.desc()).all()
    
    return blogs
