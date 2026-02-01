from sqlalchemy import Column, String, Boolean, Integer, Float, Date, DateTime, ForeignKey, Text, Enum, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
import uuid
from datetime import datetime
import enum

from app.database import Base

class LocationStatus(str, enum.Enum):
    visited = "visited"
    planned = "planned"
    archived = "archived"

class UserRole(str, enum.Enum):
    user = "user"
    manager = "manager"
    administrator = "administrator"

# Association tables for many-to-many relationships
location_tags = Table('location_tags', Base.metadata,
    Column('location_id', UUID(as_uuid=True), ForeignKey('locations.id', ondelete='CASCADE')),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id', ondelete='CASCADE'))
)

find_tags = Table('find_tags', Base.metadata,
    Column('find_id', UUID(as_uuid=True), ForeignKey('finds.id', ondelete='CASCADE')),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id', ondelete='CASCADE'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255))
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    locations = relationship("Location", back_populates="user", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    category = Column(String(100))  # e.g., "location_type", "mineral_category"
    parent_id = Column(UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Self-referential relationship for hierarchical tags
    parent = relationship("Tag", remote_side=[id], back_populates="children")
    children = relationship("Tag", back_populates="parent", cascade="all, delete-orphan")
    
    # Many-to-many relationships
    locations = relationship("Location", secondary=location_tags, back_populates="tags")
    finds = relationship("Find", secondary=find_tags, back_populates="tags")

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    coordinates = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(LocationStatus), default=LocationStatus.planned)
    visit_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="locations")
    photos = relationship("Photo", back_populates="location", cascade="all, delete-orphan")
    blog_entries = relationship("BlogEntry", back_populates="location", cascade="all, delete-orphan")
    finds = relationship("Find", back_populates="location", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=location_tags, back_populates="locations")

class Photo(Base):
    __tablename__ = "photos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id", ondelete="CASCADE"))
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    thumbnail_path = Column(String(500))
    width = Column(Integer)
    height = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    location = relationship("Location", back_populates="photos")

class BlogEntry(Base):
    __tablename__ = "blog_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id", ondelete="CASCADE"))
    title = Column(String(255))
    content = Column(Text)
    content_html = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    location = relationship("Location", back_populates="blog_entries")

class Find(Base):
    __tablename__ = "finds"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    mineral_type = Column(String(255))
    description = Column(Text)
    quantity = Column(Integer, default=1)
    found_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    location = relationship("Location", back_populates="finds")
    tags = relationship("Tag", secondary=find_tags, back_populates="finds")
