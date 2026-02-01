import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { exportsAPI } from '../api';
import { ExportFormat, LocationStatus } from '../types';

const ExportsPage: React.FC = () => {
  const [format, setFormat] = useState<ExportFormat>('geojson');
  const [statusFilter, setStatusFilter] = useState<LocationStatus[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await exportsAPI.export({
        format,
        status_filter: statusFilter.length > 0 ? statusFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const extensions: Record<ExportFormat, string> = {
        geojson: 'geojson',
        kml: 'kml',
        csv: 'csv',
        zip: 'zip',
      };
      link.setAttribute('download', `locations.${extensions[format]}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Export byl úspěšně stažen');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg || JSON.stringify(e)).join(', '));
      } else if (detail && typeof detail === 'object') {
        setError(JSON.stringify(detail));
      } else {
        setError('Export se nezdařil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: LocationStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
      >
        Export dat
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Formát exportu</InputLabel>
            <Select
              value={format}
              label="Formát exportu"
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              <MenuItem value="geojson">GeoJSON (pro GIS aplikace)</MenuItem>
              <MenuItem value="kml">KML (pro Google Earth/Maps)</MenuItem>
              <MenuItem value="csv">CSV (tabulka)</MenuItem>
              <MenuItem value="zip">ZIP (archiv všech fotek)</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Filtrovat podle stavu
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={statusFilter.includes('visited')}
                    onChange={() => handleStatusChange('visited')}
                  />
                }
                label="Navštíveno"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={statusFilter.includes('planned')}
                    onChange={() => handleStatusChange('planned')}
                  />
                }
                label="Plánováno"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={statusFilter.includes('archived')}
                    onChange={() => handleStatusChange('archived')}
                  />
                }
                label="Archivováno"
              />
            </FormGroup>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Filtrovat podle data návštěvy
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Od data"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Do data"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'Exportuji...' : 'Stáhnout export'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          O formátech
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>GeoJSON:</strong> Otevřený formát pro geografická data, použitelný v GIS aplikacích jako QGIS nebo webových mapách.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>KML:</strong> Formát používaný Google Earth a Google Maps pro zobrazení geografických dat.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>CSV:</strong> Tabulkový formát otevíratelný v Excel, LibreOffice Calc nebo jiných tabulkových procesorech.
        </Typography>
        <Typography variant="body2">
          <strong>ZIP:</strong> Archiv obsahující všechny fotografie z vybraných lokalit.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ExportsPage;
