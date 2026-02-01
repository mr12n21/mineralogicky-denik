import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider } from '@mui/material';
import { Menu as MenuIcon, Map as MapIcon, List as ListIcon, GetApp as ExportIcon, ExitToApp as LogoutIcon, People as PeopleIcon, Label as LabelIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { text: 'Mapa', icon: <MapIcon />, path: '/map' },
    { text: 'Lokality', icon: <ListIcon />, path: '/locations' },
    { text: 'Export', icon: <ExportIcon />, path: '/exports' },
  ];

  const adminMenuItems = [
    { text: 'Správa uživatelů', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Správa štítků', icon: <LabelIcon />, path: '/admin/tags' },
  ];

  const isAdmin = user?.role === 'administrator' || user?.role === 'manager';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <AppBar position="static">
        <Toolbar variant="dense" sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Mineralogický deník
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 2,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {user?.full_name || user?.username}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {isAdmin && (
            <>
              <Divider />
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Administrace" 
                    primaryTypographyProps={{ 
                      variant: 'overline', 
                      color: 'text.secondary' 
                    }} 
                  />
                </ListItem>
                {adminMenuItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
