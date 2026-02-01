import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { locationsAPI, photosAPI } from '../api';
import { Location } from '../types';
import { STATUS_LABELS, MARKER_COLORS, MAP_CONFIG, API_ENDPOINTS } from '../config';
import LocationFormDialog from '../components/LocationFormDialog';
import 'react-quill/dist/quill.snow.css';

const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchLocation = React.useCallback(async () => {
    if (!id) return;
    try {
      const response = await locationsAPI.get(id);
      setLocation(response.data);
    } catch (error) {
      console.error('Failed to fetch location:', error);
      alert('Nepodařilo se načíst lokalitu');
      navigate('/locations');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handlePhotoUpload = async () => {
    if (!selectedFile || !id) return;

    try {
      await photosAPI.upload(id, selectedFile);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      fetchLocation();
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Nepodařilo se nahrát fotografii');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (window.confirm('Opravdu chcete smazat tuto fotografii?')) {
      try {
        await photosAPI.delete(photoId);
        fetchLocation();
      } catch (error) {
        console.error('Failed to delete photo:', error);
        alert('Nepodařilo se smazat fotografii');
      }
    }
  };

  if (loading || !location) {
    return (
      <Container>
        <Typography>Načítání...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/locations')}
        sx={{ mb: 2 }}
      >
        Zpět na seznam
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {location.name}
            </Typography>
            <Chip
              label={STATUS_LABELS[location.status]}
              sx={{
                backgroundColor: MARKER_COLORS[location.status],
                color: 'white',
              }}
            />
          </Box>
          <Box>
            <IconButton onClick={() => setEditDialogOpen(true)} title="Upravit lokalitu">
              <EditIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              <strong>Zeměpisná šířka:</strong> {location.latitude.toFixed(6)}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Zeměpisná délka:</strong> {location.longitude.toFixed(6)}
            </Typography>
            {location.visit_date && (
              <Typography variant="body1" paragraph>
                <strong>Datum návštěvy:</strong>{' '}
                {new Date(location.visit_date).toLocaleDateString('cs-CZ')}
              </Typography>
            )}
            {location.description && (
              <Typography variant="body1" paragraph>
                <strong>Popis:</strong> {location.description}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300, width: '100%' }}>
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution={MAP_CONFIG.TILE_ATTRIBUTION}
                  url={MAP_CONFIG.TILE_URL}
                />
                <Marker position={[location.latitude, location.longitude]} />
              </MapContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Fotografie</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setUploadDialogOpen(true)}
          >
            Nahrát foto
          </Button>
        </Box>
        <Grid container spacing={2}>
          {location.photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={API_ENDPOINTS.PHOTO_FILE(photo.id, false)}
                  alt={photo.original_filename}
                />
                <CardContent>
                  <Typography variant="body2">{photo.original_filename}</Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {location.photos.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Zatím nejsou nahrány žádné fotografie
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Nálezy
        </Typography>
        <List>
          {location.finds.map((find) => (
            <ListItem key={find.id}>
              <ListItemText
                primary={find.name}
                secondary={
                  <>
                    {find.mineral_type && `Typ: ${find.mineral_type}`}
                    {find.description && ` • ${find.description}`}
                    {` • Množství: ${find.quantity}`}
                  </>
                }
              />
            </ListItem>
          ))}
          {location.finds.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Zatím nejsou evidovány žádné nálezy
            </Typography>
          )}
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Blog / Poznámky
        </Typography>
        {location.blog_entries.map((blog) => (
          <Box key={blog.id} sx={{ mb: 3 }}>
            {blog.title && (
              <Typography variant="h6" gutterBottom>
                {blog.title}
              </Typography>
            )}
            <div dangerouslySetInnerHTML={{ __html: blog.content_html || blog.content || '' }} />
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}
        {location.blog_entries.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Zatím nejsou žádné poznámky
          </Typography>
        )}
      </Paper>

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Nahrát fotografii</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button onClick={() => setUploadDialogOpen(false)}>Zrušit</Button>
              <Button
                variant="contained"
                onClick={handlePhotoUpload}
                disabled={!selectedFile}
              >
                Nahrát
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <LocationFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => {
          setEditDialogOpen(false);
          fetchLocation();
        }}
        location={{
          id: location.id,
          name: location.name,
          description: location.description,
          latitude: location.latitude,
          longitude: location.longitude,
          status: location.status,
          visit_date: location.visit_date || '',
        }}
      />
    </Container>
  );
};

export default LocationDetailPage;
