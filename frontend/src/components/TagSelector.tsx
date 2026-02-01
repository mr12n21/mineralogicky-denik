import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
} from '@mui/material';
import { tagsAPI } from '../api';
import { Tag } from '../types';

interface TagSelectorProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  category?: string;
  label?: string;
  placeholder?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  value,
  onChange,
  category,
  label = 'Štítky',
  placeholder = 'Vyberte štítky',
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await tagsAPI.list(category);
      setTags(response.data);
    } catch (error) {
      console.error('Chyba při načítání tagů:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTags = tags.filter(tag => value.includes(tag.id));

  return (
    <Autocomplete
      multiple
      options={tags}
      value={selectedTags}
      onChange={(_, newValue) => {
        onChange(newValue.map(tag => tag.id));
      }}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.name}
            {...getTagProps({ index })}
            key={option.id}
          />
        ))
      }
    />
  );
};

export default TagSelector;
