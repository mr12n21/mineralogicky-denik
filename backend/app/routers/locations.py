from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from geoalchemy2.functions import ST_Distance, ST_MakePoint, ST_DWithin
from geoalchemy2.elements import WKTElement
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models import User, Location, Photo, LocationStatus, Tag
from app.schemas import LocationCreate, LocationUpdate, LocationResponse, LocationListResponse
from app.auth import get_current_user

router = APIRouter()

@router.post("", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
async def create_location(
    location: LocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create point geometry
    point = WKTElement(f'POINT({location.longitude} {location.latitude})', srid=4326)
    
    db_location = Location(
        user_id=current_user.id,
        name=location.name,
        description=location.description,
        coordinates=point,
        latitude=location.latitude,
        longitude=location.longitude,
        status=location.status,
        visit_date=location.visit_date
    )
    
    # Add tags if provided
    if location.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(location.tag_ids)).all()
        db_location.tags = tags
    
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    
    return db_location

@router.get("", response_model=List[LocationListResponse])
async def list_locations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[LocationStatus] = None,
    search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(
        Location,
        func.count(Photo.id).label('photo_count')
    ).outerjoin(Photo).group_by(Location.id)
    
    query = query.filter(Location.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Location.status == status_filter)
    
    if search:
        query = query.filter(
            or_(
                Location.name.ilike(f"%{search}%"),
                Location.description.ilike(f"%{search}%")
            )
        )
    
    if date_from:
        query = query.filter(Location.visit_date >= date_from)
    
    if date_to:
        query = query.filter(Location.visit_date <= date_to)
    
    query = query.order_by(Location.created_at.desc())
    results = query.offset(skip).limit(limit).all()
    
    return [
        LocationListResponse(
            id=location.id,
            name=location.name,
            latitude=location.latitude,
            longitude=location.longitude,
            status=location.status,
            visit_date=location.visit_date,
            photo_count=photo_count,
            created_at=location.created_at,
            tags=location.tags
        )
        for location, photo_count in results
    ]

@router.get("/nearby")
async def get_nearby_locations(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(10, ge=0.1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create point for search center
    center = ST_MakePoint(lon, lat)
    
    # Convert km to degrees (approximate)
    radius_degrees = radius_km / 111.32
    
    locations = db.query(Location).filter(
        Location.user_id == current_user.id,
        ST_DWithin(Location.coordinates, center, radius_degrees)
    ).all()
    
    return locations

@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.user_id == current_user.id
    ).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    return location

@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: str,
    location_update: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_location = db.query(Location).filter(
        Location.id == location_id,
        Location.user_id == current_user.id
    ).first()
    
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    update_data = location_update.model_dump(exclude_unset=True)
    
    # Handle tags separately
    tag_ids = update_data.pop('tag_ids', None)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        db_location.tags = tags
    
    # Update coordinates if latitude or longitude changed
    if 'latitude' in update_data or 'longitude' in update_data:
        lat = update_data.get('latitude', db_location.latitude)
        lon = update_data.get('longitude', db_location.longitude)
        update_data['coordinates'] = WKTElement(f'POINT({lon} {lat})', srid=4326)
    
    for field, value in update_data.items():
        setattr(db_location, field, value)
    
    db.commit()
    db.refresh(db_location)
    
    return db_location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.user_id == current_user.id
    ).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    db.delete(location)
    db.commit()
    
    return None
