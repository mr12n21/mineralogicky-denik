from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Location, Find, Tag
from app.schemas import FindCreate, FindUpdate, FindResponse
from app.auth import get_current_user

router = APIRouter()

@router.post("", response_model=FindResponse, status_code=status.HTTP_201_CREATED)
async def create_find(
    find: FindCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify location exists and belongs to user
    location = db.query(Location).filter(
        Location.id == find.location_id,
        Location.user_id == current_user.id
    ).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    db_find = Find(
        location_id=find.location_id,
        name=find.name,
        mineral_type=find.mineral_type,
        description=find.description,
        quantity=find.quantity,
        found_date=find.found_date
    )
    
    # Add tags if provided
    if find.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(find.tag_ids)).all()
        db_find.tags = tags
    
    db.add(db_find)
    db.commit()
    db.refresh(db_find)
    
    return db_find

@router.get("/{find_id}", response_model=FindResponse)
async def get_find(
    find_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    find = db.query(Find).join(Location).filter(
        Find.id == find_id,
        Location.user_id == current_user.id
    ).first()
    
    if not find:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Find not found"
        )
    
    return find

@router.put("/{find_id}", response_model=FindResponse)
async def update_find(
    find_id: str,
    find_update: FindUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_find = db.query(Find).join(Location).filter(
        Find.id == find_id,
        Location.user_id == current_user.id
    ).first()
    
    if not db_find:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Find not found"
        )
    
    update_data = find_update.model_dump(exclude_unset=True)
    
    # Handle tags separately
    tag_ids = update_data.pop('tag_ids', None)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        db_find.tags = tags
    
    for field, value in update_data.items():
        setattr(db_find, field, value)
    
    db.commit()
    db.refresh(db_find)
    
    return db_find

@router.delete("/{find_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_find(
    find_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    find = db.query(Find).join(Location).filter(
        Find.id == find_id,
        Location.user_id == current_user.id
    ).first()
    
    if not find:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Find not found"
        )
    
    db.delete(find)
    db.commit()
    
    return None

@router.get("/location/{location_id}", response_model=List[FindResponse])
async def list_location_finds(
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
    
    finds = db.query(Find).filter(
        Find.location_id == location_id
    ).order_by(Find.created_at.desc()).all()
    
    return finds
