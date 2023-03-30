import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Hidden,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
  Box,
  MenuItem,
  Paper,
} from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon } from '@mui/icons-material';
import { Link } from 'gatsby';
import IndexSearch from './IndexSearch';

const ResponsiveAppBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home', link: '/' },
    { text: 'Table', link: '/table' },

  ];

  const drawer = (
    <div>
      <List>
        {menuItems.map((menuItem) => (
          <Link to={menuItem.link} key={menuItem.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemText primary={menuItem.text} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </div>
  );  

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <Toolbar>
        <Link
        to="/"
        style={{
          textDecoration: 'none',
          color: 'inherit',
         }}
        >
          <Typography variant="h6" component="div">
            Chrome OS Updates
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Hidden mdDown >
            <Box sx={{ width: '70%', maxWidth: '600px' }}>
              <IndexSearch />
            </Box>
          </Hidden>
        </Box>
        <Hidden smDown>
          <Box sx={{ flexGrow: 0, display: 'flex' }}>
            {menuItems.map((menuItem) => (
              <MenuItem key={menuItem.text}>
                <Link to={menuItem.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {menuItem.text}
                </Link>
              </MenuItem>
            ))}
          </Box>
        </Hidden>
        <Hidden smUp>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
      <nav>
        <Hidden smUp>
          <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            PaperProps={{
              sx: {
                width: '65%',
              },
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </AppBar>
  );
};

export default ResponsiveAppBar;
