import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import { locationsAPI } from '../api';
import { LocationCreate } from '../types';
import { STATUS_LABELS } from '../config';
import TagSelector from './TagSelector';

interface LocationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPosition?: { lat: number; lng: number };
  location?: LocationCreate & { id?: string };
}

const LocationFormDialog: React.FC<LocationFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  initialPosition,
  location,
}) => {
  const [formData, setFormData] = useState<LocationCreate>({
    name: location?.name || '',
    description: location?.description || '',
    latitude: location?.latitude || initialPosition?.lat || 49.8,
    longitude: location?.longitude || initialPosition?.lng || 15.5,
    status: location?.status || 'planned',
    visit_date: location?.visit_date || '',
    tag_ids: location?.tag_ids || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializovat formData když se otevře dialog
  React.useEffect(() => {
    if (open && location) {
      setFormData({
        name: location.name || '',
        description: location.description || '',
        latitude: location.latitude || initialPosition?.lat || 49.8,
        longitude: location.longitude || initialPosition?.lng || 15.5,
        status: location.status || 'planned',
        visit_date: location.visit_date || '',
        tag_ids: location.tag_ids || [],
      });
    } else if (open && !location) {
      setFormData({
        name: '',
        description: '',
        latitude: initialPosition?.lat || 49.8,
        longitude: initialPosition?.lng || 15.5,
        status: 'planned',
        visit_date: '',
        tag_ids: [],
      });
    }
  }, [open, location, initialPosition]);

  // Aktualizovat souřadnice při změně initialPosition
  React.useEffect(() => {
    if (initialPosition && open && !location) {
      setFormData(prev => ({
        ...prev,
        latitude: initialPosition.lat,
        longitude: initialPosition.lng,
      }));
    }
  }, [initialPosition, open, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert empty string to undefined for optional date field
      const dataToSubmit: LocationCreate = {
        name: formData.name,
        description: formData.description || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        status: formData.status,
        visit_date: formData.visit_date ? formData.visit_date : undefined,
        tag_ids: formData.tag_ids,
      };

      if (location?.id) {
        await locationsAPI.update(location.id, dataToSubmit);
      } else {
        await locationsAPI.create(dataToSubmit);
      }
      onSuccess();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg || JSON.stringify(e)).join(', '));
      } else if (detail && typeof detail === 'object') {
        setError(JSON.stringify(detail));
      } else {
        setError('Operace se nezdařila');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LocationCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={window.innerWidth < 600}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {location?.id ? 'Upravit lokalitu' : 'Přidat lokalitu'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Název lokality"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange('name')}
            />
            <TextField
              label="Popis"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={handleChange('description')}
            />
            <TextField
              label="Zeměpisná šířka"
              required
              fullWidth
              type="number"
              inputProps={{ step: 'any', min: -90, max: 90 }}
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              helperText={initialPosition ? "Souřadnice nastaveny kliknutím na mapu (můžete upravit)" : "Zadejte zeměpisnou šířku (-90 až 90)"}
            />
            <TextField
              label="Zeměpisná délka"
              required
              fullWidth
              type="number"
              inputProps={{ step: 'any', min: -180, max: 180 }}
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              helperText={initialPosition ? "Souřadnice nastaveny kliknutím na mapu (můžete upravit)" : "Zadejte zeměpisnou délku (-180 až 180)"}
            />
            <TextField
              label="Stav"
              select
              required
              fullWidth
              value={formData.status}
              onChange={handleChange('status')}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Datum návštěvy"
              type="date"
              fullWidth
              value={formData.visit_date}
              onChange={handleChange('visit_date')}
              InputLabelProps={{ shrink: true }}
              helperText="Nepovinné - vyplňte pokud jste lokalitu již navštívili"
            />
            <TagSelector
              value={formData.tag_ids || []}
              onChange={(tagIds) => setFormData({ ...formData, tag_ids: tagIds })}
              category="location_type"
              label="Typ lokality"
              placeholder="Vyberte typ lokality (kamenolom, důl, ...)"
            />
            {error && (
              <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušit</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Ukládám...' : 'Uložit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LocationFormDialog;
