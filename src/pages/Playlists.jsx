import React, { useState, useEffect } from 'react';
import { getUserPlaylists, deletePlaylist } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Play, Trash2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Playlists() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const { data, error } = await getUserPlaylists();
      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await deletePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDarkMode ? 'border-purple-500' : 'border-blue-500'
        }`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className={`text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          <p>Error loading playlists: {error}</p>
          <button
            onClick={loadPlaylists}
            className={`mt-4 px-4 py-2 rounded-md ${
              isDarkMode
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className={`text-4xl font-bold mb-8 ${
        isDarkMode
          ? 'bg-gradient-to-r from-purple-400 to-pink-600'
          : 'bg-gradient-to-r from-blue-600 to-cyan-500'
        } bg-clip-text text-transparent`}>
        Your Playlists
      </h1>

      {playlists.length === 0 ? (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Music size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-2">No playlists yet</p>
          <p className="text-sm">Create your first playlist to get started</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {playlists.map((playlist) => (
            <motion.div
              key={playlist.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="group relative"
            >
              <div className={`relative overflow-hidden rounded-xl ${
                isDarkMode
                  ? 'bg-gray-800/30 border-gray-700/50'
                  : 'bg-white/80 border-blue-200'
              } backdrop-blur-md border shadow-lg ${
                isDarkMode
                  ? 'hover:shadow-purple-500/20'
                  : 'hover:shadow-blue-500/30'
              } transition-all duration-300 transform hover:scale-[1.02] ${
                isDarkMode
                  ? 'hover:border-purple-500/50'
                  : 'hover:border-blue-400'
              }`}>
                <div 
                  className="aspect-square relative cursor-pointer"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className={`w-full h-full flex items-center justify-center ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50'
                      : 'bg-gradient-to-br from-blue-100 to-cyan-50'
                  }`}>
                    <Music size={48} className={isDarkMode ? 'text-purple-400' : 'text-blue-400'} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="font-bold text-lg text-white truncate">{playlist.name}</h3>
                    <p className="text-gray-300 text-sm truncate">{playlist.description || 'No description'}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/playlist/${playlist.id}`);
                      }}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-black/50 hover:bg-purple-500/80'
                          : 'bg-white/50 hover:bg-blue-500/80'
                      }`}
                    >
                      <Play size={20} className="text-white" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-black/50 hover:bg-red-500/80'
                          : 'bg-white/50 hover:bg-red-500/80'
                      }`}
                    >
                      <Trash2 size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gradient-to-r from-blue-400 to-cyan-400'
              }`}></div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
} 