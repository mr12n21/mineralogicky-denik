import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { tagsAPI } from '../api';
import { Tag, TagCreate, TagUpdate } from '../types';

const TagsManagementPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagCreate>({
    name: '',
    category: '',
    parent_id: undefined,
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await tagsAPI.list();
      setTags(response.data);
      setError('');
    } catch (err: any) {
      setError('Nepodařilo se načíst štítky');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        category: tag.category || '',
        parent_id: tag.parent_id,
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        category: '',
        parent_id: undefined,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTag(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingTag) {
        const updateData: TagUpdate = {
          name: formData.name,
          category: formData.category || undefined,
          parent_id: formData.parent_id,
        };
        await tagsAPI.update(editingTag.id, updateData);
      } else {
        await tagsAPI.create(formData);
      }
      await loadTags();
      handleCloseDialog();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Operace se nezdařila');
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!window.confirm('Opravdu chcete smazat tento štítek? Bude odstraněn ze všech lokalit a nálezů.')) {
      return;
    }

    try {
      await tagsAPI.delete(tagId);
      await loadTags();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Nepodařilo se smazat štítek');
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'location_type': return 'Typ lokality';
      case 'find_category': return 'Kategorie nálezů';
      case 'region': return 'Region';
      default: return category || '-';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'location_type': return 'primary';
      case 'find_category': return 'secondary';
      case 'region': return 'success';
      default: return 'default';
    }
  };

  const getParentTagName = (parentId?: string) => {
    if (!parentId) return '-';
    const parent = tags.find(t => t.id === parentId);
    return parent?.name || '-';
  };

  if (loading) {
    return (
      <Container>
        <Typography>Načítání...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Správa štítků
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Přidat štítek
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Název</TableCell>
              <TableCell>Kategorie</TableCell>
              <TableCell>Nadřazený štítek</TableCell>
              <TableCell align="right">Akce</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <strong>{tag.name}</strong>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getCategoryLabel(tag.category)}
                    color={getCategoryColor(tag.category)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getParentTagName(tag.parent_id)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(tag)}
                    title="Upravit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(tag.id)}
                    title="Smazat"
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTag ? 'Upravit štítek' : 'Přidat štítek'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Název"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Kategorie"
                select
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                helperText="Volitelné - pro organizaci štítků"
              >
                <MenuItem value="">Žádná</MenuItem>
                <MenuItem value="location_type">Typ lokality</MenuItem>
                <MenuItem value="find_category">Kategorie nálezů</MenuItem>
                <MenuItem value="region">Region</MenuItem>
              </TextField>
              <TextField
                label="Nadřazený štítek"
                select
                fullWidth
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || undefined })}
                helperText="Volitelné - pro hierarchii štítků"
              >
                <MenuItem value="">Žádný</MenuItem>
                {tags
                  .filter(t => !editingTag || t.id !== editingTag.id)
                  .map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {tag.name} {tag.category ? `(${getCategoryLabel(tag.category)})` : ''}
                    </MenuItem>
                  ))}
              </TextField>
              {error && (
                <Alert severity="error">{error}</Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Zrušit</Button>
            <Button type="submit" variant="contained">
              {editingTag ? 'Uložit' : 'Vytvořit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default TagsManagementPage;
