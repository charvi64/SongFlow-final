import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Trash2, Music } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylistDetails, removeSongFromPlaylist, deletePlaylist } from '../services/supabase';
import { usePlayer } from '../contexts/PlayerContext';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { setCurrentSong, isPlaying, togglePlay } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadPlaylistDetails();
    }
  }, [user, id]);

  const loadPlaylistDetails = async () => {
    try {
      setLoading(true);
      const data = await getPlaylistDetails(id);
      setPlaylist(data);
      setError(null);
    } catch (error) {
      console.error('Error loading playlist details:', error);
      setError(error.message);
      toast.error('Failed to load playlist details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    if (!isPlaying) {
      togglePlay();
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const loadingToast = toast.loading('Removing song from playlist...');
      await removeSongFromPlaylist(id, songId);
      
      toast.success('Song removed from playlist', {
        id: loadingToast,
        duration: 3000,
        style: {
          background: isDarkMode ? '#1F2937' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#000000',
          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
        },
      });
      
      loadPlaylistDetails();
    } catch (error) {
      console.error('Error removing song:', error);
      toast.error('Failed to remove song from playlist');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }
    
    try {
      const loadingToast = toast.loading('Deleting playlist...');
      const { success, error } = await deletePlaylist(id);
      
      if (success) {
        toast.success('Playlist deleted successfully', {
          id: loadingToast,
          duration: 3000,
          style: {
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#000000',
            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
          },
        });
        navigate('/library');
      } else {
        toast.error('Failed to delete playlist', {
          id: loadingToast,
          duration: 3000,
          style: {
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#000000',
            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
          },
        });
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
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
          <p>Error loading playlist: {error}</p>
          <button
            onClick={loadPlaylistDetails}
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

  if (!playlist) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Playlist not found</p>
          <button
            onClick={() => navigate('/library')}
            className={`mt-4 px-4 py-2 rounded-md ${
              isDarkMode
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            Go to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-blue-50 via-blue-100 to-white text-gray-900'
    }`}>
      <Toaster position="top-right" />
      
      <div className={`max-w-7xl mx-auto ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-start gap-8 mb-12">
          <button
            onClick={() => navigate('/library')}
            className={`p-3 rounded-full ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700' 
                : 'bg-white hover:bg-gray-100'
            } shadow-lg transform transition-all duration-200 hover:scale-110`}
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex-1">
            <h1 className={`text-5xl font-bold bg-clip-text text-transparent mb-3 ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500'
                : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400'
            }`}>
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {playlist.description}
              </p>
            )}
            <div className="flex items-center gap-6 mt-6">
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {playlist.songs?.length || 0} {playlist.songs?.length === 1 ? 'song' : 'songs'}
              </p>
              <button
                onClick={handleDeletePlaylist}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transform transition-all duration-200 hover:scale-105 shadow-lg`}
              >
                <Trash2 size={20} />
                Delete Playlist
              </button>
            </div>
          </div>
        </div>

        {playlist.songs?.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
          } backdrop-blur-sm border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Music size={64} className={`mx-auto mb-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className="text-2xl mb-4 font-medium">This playlist is empty</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add songs to your playlist to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {playlist.songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group flex items-center justify-between p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}>
                    <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {index + 1}
                    </span>
                  </div>
                  <img
                    src={song.cover_url || 'https://placehold.co/400x400?text=No+Cover'}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{song.title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {song.artist}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handlePlaySong(song)}
                    className={`p-3 rounded-full opacity-0 group-hover:opacity-100 ${
                      isDarkMode 
                        ? 'bg-purple-500 hover:bg-purple-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white shadow-lg transform transition-all duration-200 hover:scale-110`}
                    title="Play"
                  >
                    <Play size={20} />
                  </button>
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="p-3 rounded-full opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white shadow-lg transform transition-all duration-200 hover:scale-110"
                    title="Remove from playlist"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 