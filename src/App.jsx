import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PlayerProvider } from './contexts/PlayerContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import Search from './components/Search';
import Library from './components/Library';
import Profile from './components/Profile';
import Layout from './components/Layout';
import AudioPlayer from './components/AudioPlayer';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PlayerProvider>
          <Router>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/" element={
                <PrivateRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/search" element={
                <PrivateRoute>
                  <Layout>
                    <Search />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/library" element={
                <PrivateRoute>
                  <Layout>
                    <Library />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/playlists" element={
                <PrivateRoute>
                  <Layout>
                    <Playlists />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/playlist/:id" element={
                <PrivateRoute>
                  <Layout>
                    <PlaylistDetail />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </PlayerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 