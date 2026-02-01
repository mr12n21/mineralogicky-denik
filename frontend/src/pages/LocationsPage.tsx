import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TablePagination,
} from '@mui/material';
import { Visibility as ViewIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { locationsAPI } from '../api';
import { LocationListItem, LocationStatus } from '../types';
import { STATUS_LABELS, MARKER_COLORS } from '../config';
import LocationFormDialog from '../components/LocationFormDialog';

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LocationStatus | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchLocations = React.useCallback(async () => {
    try {
      const params: any = { limit: 1000 };
      if (search) params.search = search;
      if (statusFilter) params.status_filter = statusFilter;

      const response = await locationsAPI.list(params);
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Opravdu chcete smazat tuto lokalitu?')) {
      try {
        await locationsAPI.delete(id);
        fetchLocations();
      } catch (error) {
        console.error('Failed to delete location:', error);
        alert('Nepodařilo se smazat lokalitu');
      }
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedLocations = locations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: 2 
      }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Lokality
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          fullWidth={true}
          sx={{ display: { xs: 'block', sm: 'inline-flex' }, maxWidth: { sm: 'auto' } }}
        >
          Přidat lokalitu
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          label="Hledat"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Stav</InputLabel>
          <Select
            value={statusFilter}
            label="Stav"
            onChange={(e) => setStatusFilter(e.target.value as LocationStatus | '')}
          >
            <MenuItem value="">Vše</MenuItem>
            <MenuItem value="visited">Navštíveno</MenuItem>
            <MenuItem value="planned">Plánováno</MenuItem>
            <MenuItem value="archived">Archivováno</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
          <TableHead>
            <TableRow>
              <TableCell>Název</TableCell>
              <TableCell>Stav</TableCell>
              <TableCell>Zeměpisná šířka</TableCell>
              <TableCell>Zeměpisná délka</TableCell>
              <TableCell>Datum návštěvy</TableCell>
              <TableCell>Počet fotek</TableCell>
              <TableCell>Vytvořeno</TableCell>
              <TableCell>Akce</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedLocations.map((location) => (
              <TableRow key={location.id} hover>
                <TableCell>{location.name}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[location.status]}
                    size="small"
                    sx={{
                      backgroundColor: MARKER_COLORS[location.status],
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>{location.latitude.toFixed(6)}</TableCell>
                <TableCell>{location.longitude.toFixed(6)}</TableCell>
                <TableCell>
                  {location.visit_date
                    ? new Date(location.visit_date).toLocaleDateString('cs-CZ')
                    : '-'}
                </TableCell>
                <TableCell>{location.photo_count}</TableCell>
                <TableCell>
                  {new Date(location.created_at).toLocaleDateString('cs-CZ')}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/locations/${location.id}`)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(location.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={locations.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Řádků na stránku:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
      />

      <LocationFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          fetchLocations();
        }}
      />
    </Container>
  );
};

export default LocationsPage;
