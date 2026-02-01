import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import LocationsPage from './pages/LocationsPage';
import LocationDetailPage from './pages/LocationDetailPage';
import ExportsPage from './pages/ExportsPage';
import UsersManagementPage from './pages/UsersManagementPage';
import TagsManagementPage from './pages/TagsManagementPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Načítání...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Načítání...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'administrator' && user?.role !== 'manager') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<MapPage />} />
                      <Route path="/map" element={<MapPage />} />
                      <Route path="/locations" element={<LocationsPage />} />
                      <Route path="/locations/:id" element={<LocationDetailPage />} />
                      <Route path="/exports" element={<ExportsPage />} />
                      <Route
                        path="/admin/users"
                        element={
                          <AdminRoute>
                            <UsersManagementPage />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/tags"
                        element={
                          <AdminRoute>
                            <TagsManagementPage />
                          </AdminRoute>
                        }
                      />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
