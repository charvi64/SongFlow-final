import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Heart, Play, Plus, Music, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { createPlaylist, getUserPlaylists, getPlaylistSongs, deletePlaylist, getAllSongs, addSongToPlaylist } from '../services/supabase';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Library() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [newPlaylistData, setNewPlaylistData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadPlaylists();
      loadAllSongs();
    }
  }, [user]);

  const loadAllSongs = async () => {
    try {
      const songs = await getAllSongs();
      setAllSongs(songs);
    } catch (error) {
      console.error('Error loading songs:', error);
      toast.error('Failed to load songs');
    }
  };

  const loadPlaylists = async () => {
    try {
      const { data: userPlaylists, error } = await getUserPlaylists();
      
      if (error) {
        setError(error);
        toast.error('Failed to load playlists');
        return;
      }

      // Load song counts for each playlist
      const playlistsWithSongs = await Promise.all(
        userPlaylists.map(async (playlist) => {
          const songs = await getPlaylistSongs(playlist.id);
          return { ...playlist, tracks: songs.length };
        })
      );
      setPlaylists(playlistsWithSongs);
      setError(null);
    } catch (error) {
      console.error('Error loading playlists:', error);
      setError(error.message);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      if (!newPlaylistData.name.trim()) {
        toast.error('Please enter a playlist name');
        return;
      }

      const loadingToast = toast.loading('Creating playlist...');
      
      await createPlaylist(
        newPlaylistData.name,
        newPlaylistData.description
      );
      
      toast.success('Playlist created successfully!', {
        id: loadingToast,
        duration: 3000,
        style: {
          background: isDarkMode ? '#1F2937' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#000000',
          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
        },
      });
      
      setNewPlaylistData({ name: '', description: '' });
      setShowEditModal(false);
      loadPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist. Please try again.', {
        duration: 3000,
        style: {
          background: isDarkMode ? '#1F2937' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#000000',
          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
        },
      });
    }
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setNewPlaylistData({
      name: playlist.name,
      description: playlist.description
    });
    setShowEditModal(true);
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const loadingToast = toast.loading('Deleting playlist...');
      
      const { success, error } = await deletePlaylist(playlistId);
      
      if (success) {
        toast.success('Playlist deleted successfully!', {
          id: loadingToast,
          duration: 3000,
          style: {
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#000000',
            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
          },
        });
        loadPlaylists();
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

  const handleAddSongs = async () => {
    try {
      if (selectedSongs.length === 0) {
        toast.error('Please select at least one song');
        return;
      }

      const loadingToast = toast.loading('Adding songs to playlist...');
      let successCount = 0;
      let errorCount = 0;
      
      // Add each selected song to the playlist
      for (const songId of selectedSongs) {
        try {
          await addSongToPlaylist(selectedPlaylist.id, songId);
          successCount++;
        } catch (error) {
          console.error('Error adding song:', error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Added ${successCount} song${successCount === 1 ? '' : 's'} to playlist`, {
          id: loadingToast,
          duration: 3000,
          style: {
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#000000',
            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
          },
        });
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to add ${errorCount} song${errorCount === 1 ? '' : 's'}`, {
          duration: 3000,
          style: {
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#000000',
            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
          },
        });
      }
      
      setSelectedSongs([]);
      setShowAddSongsModal(false);
      loadPlaylists();
    } catch (error) {
      console.error('Error adding songs:', error);
      toast.error(error.message || 'Failed to add songs to playlist');
    }
  };

  const toggleSongSelection = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
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
          <p>Error loading library: {error}</p>
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
    <div className={`min-h-screen p-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-blue-50 via-blue-100 to-white text-gray-900'
    }`}>
      <Toaster position="top-right" />
      
      <div className={`max-w-7xl mx-auto ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className={`text-5xl font-bold bg-clip-text text-transparent ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500'
                : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400'
            }`}>
              Your Library
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your music collections
            </p>
          </div>
          <button 
            onClick={() => {
              setEditingPlaylist(null);
              setNewPlaylistData({ name: '', description: '' });
              setShowEditModal(true);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
            } text-white transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            <Plus size={24} />
            <span className="font-medium">Create Playlist</span>
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
          } backdrop-blur-sm border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Music size={64} className={`mx-auto mb-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className="text-2xl mb-4 font-medium">Your library is empty</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your first playlist to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative p-6 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer`}
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
                      : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                  }`}>
                    <Music size={32} className={isDarkMode ? 'text-purple-400' : 'text-blue-500'} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{playlist.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {playlist.tracks} {playlist.tracks === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlaylist(playlist);
                      setShowAddSongsModal(true);
                    }}
                    className={`p-2 rounded-full ${
                      isDarkMode 
                        ? 'bg-purple-500 hover:bg-purple-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white shadow-lg transform transition-transform duration-200 hover:scale-110`}
                    title="Add Songs"
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transform transition-transform duration-200 hover:scale-110"
                    title="Delete Playlist"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-4">
                {editingPlaylist ? 'Edit Playlist' : 'Create Playlist'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newPlaylistData.name}
                    onChange={(e) => setNewPlaylistData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-100 border-gray-300'
                    } border`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newPlaylistData.description}
                    onChange={(e) => setNewPlaylistData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-100 border-gray-300'
                    } border`}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlaylist}
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {editingPlaylist ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Songs Modal */}
        {showAddSongsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-2xl w-full rounded-lg p-6 ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Add Songs to {selectedPlaylist?.name}
                </h2>
                <button
                  onClick={() => {
                    setShowAddSongsModal(false);
                    setSelectedSongs([]);
                  }}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto mb-4">
                {allSongs.map(song => (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedSongs.includes(song.id)}
                        onChange={() => toggleSongSelection(song.id)}
                        className="h-4 w-4"
                      />
                      <img
                        src={song.cover_url || 'https://placehold.co/400x400?text=No+Cover'}
                        alt={song.title}
                        className="w-10 h-10 rounded-md"
                      />
                      <div>
                        <h3 className="font-medium">{song.title}</h3>
                        <p className="text-sm text-gray-500">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddSongsModal(false);
                    setSelectedSongs([]);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSongs}
                  className={`px-4 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  Add Selected Songs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 