from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
import enum

class LocationStatus(str, enum.Enum):
    visited = "visited"
    planned = "planned"
    archived = "archived"

class UserRole(str, enum.Enum):
    user = "user"
    manager = "manager"
    administrator = "administrator"

# Tag schemas
class TagBase(BaseModel):
    name: str
    category: Optional[str] = None
    parent_id: Optional[UUID] = None

class TagCreate(TagBase):
    pass

class TagUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    parent_id: Optional[UUID] = None

class TagResponse(TagBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    username: str
    email: str  # Using str to allow .local and other non-standard domains
    full_name: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Basic email validation allowing .local and other domains"""
        if not v or '@' not in v:
            raise PydanticCustomError(
                'value_error',
                'Invalid email format',
            )
        # Very permissive validation: just check basic @ structure
        parts = v.split('@')
        if len(parts) != 2 or not parts[0] or not parts[1] or '.' not in parts[1]:
            raise PydanticCustomError(
                'value_error',
                'Invalid email format',
            )
        return v.lower()

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.user

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Location schemas
class LocationBase(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    status: LocationStatus = LocationStatus.planned
    visit_date: Optional[date] = None

class LocationCreate(LocationBase):
    tag_ids: Optional[List[UUID]] = []

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    status: Optional[LocationStatus] = None
    visit_date: Optional[date] = None
    tag_ids: Optional[List[UUID]] = None

class PhotoResponse(BaseModel):
    id: UUID
    filename: str
    original_filename: str
    file_path: str
    thumbnail_path: Optional[str] = None
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class BlogEntryResponse(BaseModel):
    id: UUID
    title: Optional[str] = None
    content: Optional[str] = None
    content_html: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FindResponse(BaseModel):
    id: UUID
    name: str
    mineral_type: Optional[str] = None
    description: Optional[str] = None
    quantity: int
    found_date: Optional[date] = None
    created_at: datetime
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True

class LocationResponse(LocationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    photos: List[PhotoResponse] = []
    blog_entries: List[BlogEntryResponse] = []
    finds: List[FindResponse] = []
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True

class LocationListResponse(BaseModel):
    id: UUID
    name: str
    latitude: float
    longitude: float
    status: LocationStatus
    visit_date: Optional[date] = None
    photo_count: int = 0
    created_at: datetime
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True

# Blog schemas
class BlogEntryCreate(BaseModel):
    location_id: UUID
    title: Optional[str] = None
    content: str
    content_html: Optional[str] = None

class BlogEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_html: Optional[str] = None

# Find schemas
class FindCreate(BaseModel):
    location_id: UUID
    name: str
    mineral_type: Optional[str] = None
    description: Optional[str] = None
    quantity: int = 1
    found_date: Optional[date] = None
    tag_ids: Optional[List[UUID]] = []

class FindUpdate(BaseModel):
    name: Optional[str] = None
    mineral_type: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    found_date: Optional[date] = None
    tag_ids: Optional[List[UUID]] = None

# Export schemas
class ExportFormat(str, enum.Enum):
    geojson = "geojson"
    kml = "kml"
    csv = "csv"
    zip_photos = "zip"

class ExportRequest(BaseModel):
    format: ExportFormat
    status_filter: Optional[List[LocationStatus]] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
