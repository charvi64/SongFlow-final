import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, Play, Heart } from 'lucide-react';
import { searchSongs, toggleLikeSong, getLikedSongs } from '../services/supabase';
import { usePlayer } from '../contexts/PlayerContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [likedSongs, setLikedSongs] = useState({});
  const { playSong } = usePlayer();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  // Load liked songs on component mount
  useEffect(() => {
    const loadLikedSongs = async () => {
      if (!user) return;
      
      try {
        const likedSongIds = await getLikedSongs();
        const likedMap = {};
        likedSongIds.forEach(songId => {
          likedMap[songId] = true;
        });
        setLikedSongs(likedMap);
      } catch (error) {
        console.error('Error loading liked songs:', error);
      }
    };

    loadLikedSongs();
  }, [user]);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSongs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchSongs(searchQuery.trim());
      setSongs(results || []);
    } catch (error) {
      console.error('Error searching songs:', error);
      setError('Failed to search songs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => performSearch(query), 300),
    [performSearch]
  );

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery === '') {
      setSongs([]);
      setError(null);
      return;
    }
    
    debouncedSearch(newQuery);
  };

  const handleToggleLike = async (e, songId) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (!user) {
      // Handle not logged in state if needed
      return;
    }

    try {
      const isLiked = await toggleLikeSong(songId);
      setLikedSongs(prev => ({
        ...prev,
        [songId]: isLiked
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel;
    };
  }, [debouncedSearch]);

  const scrollbarStyles = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-4xl font-bold mb-8 ${
        isDarkMode
          ? 'bg-gradient-to-r from-purple-400 to-pink-600'
          : 'bg-gradient-to-r from-blue-600 to-cyan-500'
        } bg-clip-text text-transparent`}>
        Search
      </h1>

      <div className="w-full max-w-2xl">
        <div className={`flex items-center gap-4 p-3 rounded-full ${
          isDarkMode
            ? 'bg-gray-800/50 focus-within:bg-gray-800'
            : 'bg-white/80 focus-within:bg-white'
        } backdrop-blur-md border ${
          isDarkMode
            ? 'border-gray-700/50'
            : 'border-blue-200'
        } shadow-lg transition-all duration-300`}>
          <SearchIcon size={20} className={isDarkMode ? 'text-gray-400' : 'text-blue-400'} />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search songs, artists, or albums..."
            className={`flex-1 bg-transparent border-none outline-none ${
              isDarkMode
                ? 'placeholder-gray-500 text-white'
                : 'placeholder-blue-300 text-gray-900'
            }`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            isDarkMode ? 'border-purple-500' : 'border-blue-500'
          }`}></div>
        </div>
      ) : error ? (
        <div className={`text-center p-4 rounded-lg ${
          isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
        }`}>
          {error}
        </div>
      ) : songs.length > 0 ? (
        <div className="relative w-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
            style={scrollbarStyles}
          >
            {songs.map((song) => (
              <motion.div
                key={song.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="group flex-shrink-0 relative"
                style={{ width: '200px' }}
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
                  <div className="aspect-square relative">
                    <img
                      src={song.cover_url || 'https://placehold.co/400x400?text=No+Cover'}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="font-bold text-lg text-white truncate">{song.title}</h3>
                      <p className="text-gray-300 text-sm truncate">{song.artist}</p>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button 
                        onClick={() => playSong(song)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-black/50 hover:bg-purple-500/80'
                            : 'bg-white/50 hover:bg-blue-500/80'
                        }`}
                      >
                        <Play size={20} className="text-white" />
                      </button>
                      <button 
                        onClick={(e) => handleToggleLike(e, song.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-black/50 hover:bg-purple-500/80'
                            : 'bg-white/50 hover:bg-blue-500/80'
                        }`}
                      >
                        <Heart 
                          size={20} 
                          className={`${
                            likedSongs[song.id]
                              ? 'text-red-500 fill-red-500'
                              : 'text-white'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : query ? (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p className="text-xl mb-2">No results found</p>
          <p className="text-sm">Try searching for something else</p>
        </div>
      ) : null}
    </div>
  );
} 