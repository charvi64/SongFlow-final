import React, { useState, useEffect } from 'react';
import { Home, Search, Library, ListMusic, Plus, User, X, Check, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPlaylist, getUserPlaylists } from '../services/supabase';

export default function Sidebar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadPlaylists();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadPlaylists = async () => {
    try {
      const { data: userPlaylists, error } = await getUserPlaylists();
      if (error) {
        throw error;
      }
      setPlaylists(userPlaylists || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
      setError('Failed to load playlists. Please try logging in again.');
      if (error.message === 'User not authenticated') {
        navigate('/login');
      }
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('Please log in to create a playlist');
      }

      console.log('Creating playlist with:', { playlistName, playlistDescription });
      const result = await createPlaylist(playlistName, playlistDescription);
      console.log('Playlist created:', result);
      
      setShowSuccess(true);
      await loadPlaylists();
      
      // Reset form and close modal after delay
      setTimeout(() => {
        setShowSuccess(false);
        setIsModalOpen(false);
        setPlaylistName('');
        setPlaylistDescription('');
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError(error.message || 'Failed to create playlist');
      if (error.message === 'User not authenticated') {
        navigate('/login');
      }
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">SoNgFloW</h1>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900'
                    : isDarkMode
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`
              }
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900'
                    : isDarkMode
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`
              }
            >
              <Search className="w-5 h-5 mr-3" />
              Search
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/library"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900'
                    : isDarkMode
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`
              }
            >
              <Library className="w-5 h-5 mr-3" />
              Library
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/playlists"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900'
                    : isDarkMode
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`
              }
            >
              <ListMusic className="w-5 h-5 mr-3" />
              Playlists
            </NavLink>
          </li>
        </ul>

        <div className="mt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center w-full p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5 mr-3" />
            Create Playlist
          </button>
        </div>
      </nav>

      {/* Footer Navigation */}
      <div className="relative mb-24 p-4 border-t border-gray-700">
        <div className="flex flex-col space-y-2">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? isDarkMode
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-900'
                  : isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              } shadow-sm`
            }
          >
            <User className="w-6 h-6 mr-3" />
            <span className="font-semibold">Profile</span>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-100'
            } shadow-sm`}
          >
            <LogOut className="w-6 h-6 mr-3" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>

              <form onSubmit={handleCreatePlaylist}>
                <div className="mb-4">
                  <label className="block mb-2">Name</label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 focus:bg-gray-600'
                        : 'bg-gray-100 focus:bg-white'
                    } outline-none transition-colors`}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Description (optional)</label>
                  <textarea
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 focus:bg-gray-600'
                        : 'bg-gray-100 focus:bg-white'
                    } outline-none transition-colors`}
                    rows="3"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-2 text-red-500 text-sm bg-red-100 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !playlistName.trim()}
                  className={`w-full p-2 rounded-lg font-medium transition-colors ${
                    isLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : isDarkMode
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : showSuccess ? (
                    <div className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      Created!
                    </div>
                  ) : (
                    'Create Playlist'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 