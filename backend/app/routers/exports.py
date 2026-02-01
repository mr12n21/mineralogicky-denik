from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import csv
import json
import zipfile
import os
from datetime import date

from app.database import get_db
from app.models import User, Location, Photo, LocationStatus
from app.schemas import ExportFormat, ExportRequest
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

def create_geojson(locations: List[Location]) -> dict:
    features = []
    
    for location in locations:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [location.longitude, location.latitude]
            },
            "properties": {
                "id": str(location.id),
                "name": location.name,
                "description": location.description,
                "status": location.status.value,
                "visit_date": location.visit_date.isoformat() if location.visit_date else None,
                "created_at": location.created_at.isoformat(),
                "photo_count": len(location.photos),
                "find_count": len(location.finds)
            }
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

def create_kml(locations: List[Location]) -> str:
    kml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
    kml_parts.append('<kml xmlns="http://www.opengis.net/kml/2.2">')
    kml_parts.append('<Document>')
    kml_parts.append('<name>Mineralogické lokality</name>')
    
    # Define styles for different statuses
    styles = {
        'visited': '#00FF00',
        'planned': '#FFFF00',
        'archived': '#FF0000'
    }
    
    for status_name, color in styles.items():
        kml_parts.append(f'<Style id="{status_name}">')
        kml_parts.append('<IconStyle>')
        kml_parts.append(f'<color>{color}</color>')
        kml_parts.append('</IconStyle>')
        kml_parts.append('</Style>')
    
    for location in locations:
        kml_parts.append('<Placemark>')
        kml_parts.append(f'<name>{location.name}</name>')
        if location.description:
            kml_parts.append(f'<description><![CDATA[{location.description}]]></description>')
        kml_parts.append(f'<styleUrl>#{location.status.value}</styleUrl>')
        kml_parts.append('<Point>')
        kml_parts.append(f'<coordinates>{location.longitude},{location.latitude},0</coordinates>')
        kml_parts.append('</Point>')
        kml_parts.append('</Placemark>')
    
    kml_parts.append('</Document>')
    kml_parts.append('</kml>')
    
    return '\n'.join(kml_parts)

def create_csv(locations: List[Location]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'ID', 'Název', 'Popis', 'Zeměpisná šířka', 'Zeměpisná délka',
        'Stav', 'Datum návštěvy', 'Počet fotek', 'Počet nálezů', 'Vytvořeno'
    ])
    
    # Data
    for location in locations:
        writer.writerow([
            str(location.id),
            location.name,
            location.description or '',
            location.latitude,
            location.longitude,
            location.status.value,
            location.visit_date.isoformat() if location.visit_date else '',
            len(location.photos),
            len(location.finds),
            location.created_at.isoformat()
        ])
    
    return output.getvalue()

@router.post("")
async def export_data(
    export_request: ExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Build query
    query = db.query(Location).filter(Location.user_id == current_user.id)
    
    # Apply filters
    if export_request.status_filter:
        query = query.filter(Location.status.in_(export_request.status_filter))
    
    if export_request.date_from:
        query = query.filter(Location.visit_date >= export_request.date_from)
    
    if export_request.date_to:
        query = query.filter(Location.visit_date <= export_request.date_to)
    
    locations = query.all()
    
    if not locations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No locations found matching the criteria"
        )
    
    # Generate export based on format
    if export_request.format == ExportFormat.geojson:
        data = create_geojson(locations)
        content = json.dumps(data, ensure_ascii=False, indent=2)
        media_type = "application/json"
        filename = "locations.geojson"
        
        return StreamingResponse(
            io.BytesIO(content.encode('utf-8')),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif export_request.format == ExportFormat.kml:
        content = create_kml(locations)
        media_type = "application/vnd.google-earth.kml+xml"
        filename = "locations.kml"
        
        return StreamingResponse(
            io.BytesIO(content.encode('utf-8')),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif export_request.format == ExportFormat.csv:
        content = create_csv(locations)
        media_type = "text/csv"
        filename = "locations.csv"
        
        return StreamingResponse(
            io.BytesIO(content.encode('utf-8-sig')),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif export_request.format == ExportFormat.zip_photos:
        # Create ZIP file with all photos
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for location in locations:
                location_folder = f"{location.name.replace('/', '_')}"
                
                for photo in location.photos:
                    photo_path = os.path.join(settings.UPLOAD_DIR, "photos", photo.filename)
                    if os.path.exists(photo_path):
                        zip_file.write(
                            photo_path,
                            f"{location_folder}/{photo.original_filename}"
                        )
        
        zip_buffer.seek(0)
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=photos.zip"}
        )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported export format"
        )
