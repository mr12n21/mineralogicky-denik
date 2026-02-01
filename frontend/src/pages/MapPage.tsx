import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Fab, 
  Tooltip, 
  Snackbar, 
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Map as MapIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsAPI } from '../api';
import { LocationListItem } from '../types';
import { MAP_CONFIG, MARKER_COLORS, STATUS_LABELS } from '../config';
import LocationFormDialog from '../components/LocationFormDialog';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 25px;
      height: 41px;
      border-radius: 50% 50% 50% 0;
      position: relative;
      transform: rotate(-45deg);
      border: 2px solid #fff;
    ">
      <div style="
        background: white;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        position: absolute;
        top: 7px;
        left: 7px;
      "></div>
    </div>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

type MapLayerType = 'STANDARD' | 'GEOLOGICAL' | 'SATELLITE';

const MapPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('STANDARD');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.list();
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
    console.log('Map clicked at:', newPosition);
    setClickPosition(newPosition);
    setDialogOpen(true);
    setSnackbarMessage(`Souřadnice: ${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`);
    setSnackbarOpen(true);
  };

  const handleLocationCreated = () => {
    fetchLocations();
    setDialogOpen(false);
    setClickPosition(null);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const currentLayer = MAP_CONFIG.LAYERS[mapLayer];

  return (
    <Box sx={{ height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }, position: 'relative' }}>
      {/* Map Layer Switcher */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          p: 1,
        }}
      >
        <ToggleButtonGroup
          value={mapLayer}
          exclusive
          onChange={(_, newLayer) => {
            if (newLayer !== null) {
              setMapLayer(newLayer);
            }
          }}
          size="small"
          aria-label="map layer"
        >
          <ToggleButton value="STANDARD" aria-label="standard map">
            <Tooltip title="Standardní mapa">
              <MapIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="GEOLOGICAL" aria-label="geological map">
            <Tooltip title="Geologická mapa">
              <span>🪨</span>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="SATELLITE" aria-label="satellite map">
            <Tooltip title="Satelitní mapa">
              <span>🛰️</span>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <MapContainer
        center={[MAP_CONFIG.DEFAULT_CENTER.lat, MAP_CONFIG.DEFAULT_CENTER.lng]}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          key={mapLayer}
          attribution={currentLayer.attribution}
          url={currentLayer.url}
        />
        <MapClickHandler />
        
        {/* Dočasný marker pro kliknutou pozici - zvýrazněný */}
        {clickPosition && dialogOpen && (
          <Marker
            position={[clickPosition.lat, clickPosition.lng]}
            icon={L.divIcon({
              className: 'custom-marker-new',
              html: `<div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                width: 30px;
                height: 48px;
                border-radius: 50% 50% 50% 0;
                position: relative;
                transform: rotate(-45deg);
                border: 3px solid #fff;
                box-shadow: 0 3px 14px rgba(0,0,0,0.4);
                animation: bounce 1s infinite;
              ">
                <div style="
                  background: white;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  position: absolute;
                  top: 9px;
                  left: 9px;
                "></div>
              </div>
              <style>
                @keyframes bounce {
                  0%, 100% { transform: rotate(-45deg) translateY(0); }
                  50% { transform: rotate(-45deg) translateY(-10px); }
                }
              </style>`,
              iconSize: [30, 48],
              iconAnchor: [15, 48],
              popupAnchor: [1, -40],
            })}
          >
            <Popup>
              <div>
                <strong>📍 Nová lokalita</strong><br />
                <small>{clickPosition.lat.toFixed(6)}, {clickPosition.lng.toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        <MarkerClusterGroup>
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createColoredIcon(MARKER_COLORS[location.status])}
            >
              <Popup>
                <div>
                  <h3>{location.name}</h3>
                  <p><strong>Stav:</strong> {STATUS_LABELS[location.status]}</p>
                  {location.visit_date && (
                    <p><strong>Datum návštěvy:</strong> {new Date(location.visit_date).toLocaleDateString('cs-CZ')}</p>
                  )}
                  <p><strong>Počet fotek:</strong> {location.photo_count}</p>
                  <a href={`/locations/${location.id}`}>Zobrazit detail</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <Tooltip title="Klikněte na mapu pro výběr souřadnic nebo použijte toto tlačítko" placement="left">
        <Fab
          color="primary"
          aria-label="add"
          size="medium"
          sx={{ 
            position: 'absolute', 
            bottom: { xs: 8, sm: 16 }, 
            right: { xs: 8, sm: 16 },
            zIndex: 1000
          }}
          onClick={() => {
            setClickPosition(MAP_CONFIG.DEFAULT_CENTER);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <LocationFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setClickPosition(null);
        }}
        onSuccess={handleLocationCreated}
        initialPosition={clickPosition || undefined}
      />
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MapPage;
