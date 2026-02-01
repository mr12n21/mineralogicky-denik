const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  ME: `${API_BASE_URL}/api/auth/me`,
  
  // Locations
  LOCATIONS: `${API_BASE_URL}/api/locations`,
  LOCATION_DETAIL: (id: string) => `${API_BASE_URL}/api/locations/${id}`,
  NEARBY_LOCATIONS: `${API_BASE_URL}/api/locations/nearby`,
  
  // Photos
  PHOTOS: `${API_BASE_URL}/api/photos`,
  PHOTO_DETAIL: (id: string) => `${API_BASE_URL}/api/photos/${id}`,
  PHOTO_FILE: (id: string, thumbnail: boolean = false) => 
    `${API_BASE_URL}/api/photos/${id}/file?thumbnail=${thumbnail}`,
  LOCATION_PHOTOS: (locationId: string) => 
    `${API_BASE_URL}/api/photos/location/${locationId}`,
  
  // Blogs
  BLOGS: `${API_BASE_URL}/api/blogs`,
  BLOG_DETAIL: (id: string) => `${API_BASE_URL}/api/blogs/${id}`,
  LOCATION_BLOGS: (locationId: string) => 
    `${API_BASE_URL}/api/blogs/location/${locationId}`,
  
  // Finds
  FINDS: `${API_BASE_URL}/api/finds`,
  FIND_DETAIL: (id: string) => `${API_BASE_URL}/api/finds/${id}`,
  LOCATION_FINDS: (locationId: string) => 
    `${API_BASE_URL}/api/finds/location/${locationId}`,
  
  // Exports
  EXPORTS: `${API_BASE_URL}/api/exports`,
};

export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: Number(process.env.REACT_APP_MAP_DEFAULT_LAT) || 49.8,
    lng: Number(process.env.REACT_APP_MAP_DEFAULT_LON) || 15.5,
  },
  DEFAULT_ZOOM: Number(process.env.REACT_APP_MAP_DEFAULT_ZOOM) || 7,
  
  // Map layers
  LAYERS: {
    STANDARD: {
      name: 'Standardní',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    GEOLOGICAL: {
      name: 'Geologická',
      url: 'https://tiles.macrostrat.org/carto/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://macrostrat.org/">Macrostrat</a>',
    },
    SATELLITE: {
      name: 'Satelitní',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    },
  },
  
  // Legacy exports for compatibility
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const MARKER_COLORS = {
  visited: '#4CAF50',   // Green
  planned: '#FFC107',   // Yellow/Amber
  archived: '#F44336',  // Red
};

export const STATUS_LABELS = {
  visited: 'Navštíveno',
  planned: 'Plánováno',
  archived: 'Archivováno',
};
