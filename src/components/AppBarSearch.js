import React from 'react';
import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const AppBarSearch = () => {
  return (
    <TextField
      sx={{ width: '50%' }}
      placeholder="Search for a device or board name..."
      InputProps={{
        startAdornment: <SearchIcon />,
      }}
    />
  );
};

export default AppBarSearch;
