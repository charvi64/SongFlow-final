import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';
import { getAllSongs } from '../services/supabase';
import { usePlayer } from '../contexts/PlayerContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSong, setHoveredSong] = useState(null);
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { isDarkMode } = useTheme();
  const containerRef = useRef(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const allSongs = await getAllSongs();
      console.log('Loaded songs:', allSongs);
      setSongs(allSongs);
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-purple-500' : 'border-blue-500'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-blue-50 via-blue-100 to-white text-gray-900'
    } p-6 overflow-hidden`}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className={`text-5xl font-bold bg-clip-text text-transparent ${
          isDarkMode
            ? 'bg-gradient-to-r from-purple-400 to-pink-600'
            : 'bg-gradient-to-r from-blue-600 to-cyan-500'
        } mb-2`}>
          SongFlow
        </h1>
        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>
          Your personal music journey
        </p>
      </motion.div>

      <motion.div 
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {songs.map((song, index) => (
          <motion.div
            key={song.id}
            variants={itemVariants}
            className="relative group"
            onMouseEnter={() => setHoveredSong(song.id)}
            onMouseLeave={() => setHoveredSong(null)}
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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="font-bold text-lg truncate text-white">{song.title}</h3>
                  <p className="text-gray-300 text-sm truncate">{song.artist}</p>
                </div>
                
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-black/50 hover:bg-purple-500/80'
                        : 'bg-white/50 hover:bg-blue-500/80'
                    }`}
                    onClick={() => handlePlaySong(song)}
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause size={20} className="text-white" />
                    ) : (
                      <Play size={20} className="text-white" />
                    )}
                  </button>
                  <button className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-black/50 hover:bg-red-500/80'
                      : 'bg-white/50 hover:bg-red-500/80'
                  }`}>
                    <Heart size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Glow effect on hover */}
            <div className={`absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10 ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-gradient-to-r from-blue-400 to-cyan-400'
            }`}></div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Featured section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-16"
      >
        <h2 className={`text-3xl font-bold mb-6 bg-clip-text text-transparent ${
          isDarkMode
            ? 'bg-gradient-to-r from-blue-400 to-cyan-300'
            : 'bg-gradient-to-r from-blue-700 to-cyan-600'
        }`}>
          Featured Playlists
        </h2>
        
        <div className="flex overflow-x-auto pb-6 space-x-6 scrollbar-hide">
          {songs.slice(0, 5).map((song) => (
            <div key={song.id} className="flex-shrink-0 w-64 group">
              <div className={`relative overflow-hidden rounded-xl ${
                isDarkMode
                  ? 'bg-gray-800/30 border-gray-700/50'
                  : 'bg-white/80 border-blue-200'
                } backdrop-blur-md border shadow-lg ${
                  isDarkMode
                    ? 'hover:shadow-blue-500/20'
                    : 'hover:shadow-blue-500/30'
                } transition-all duration-300`}>
                <div className="aspect-square relative">
                  <img
                    src={song.cover_url || 'https://placehold.co/400x400?text=No+Cover'}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-lg truncate text-white">{song.title}</h3>
                    <p className="text-gray-300 text-sm truncate">{song.artist}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <button 
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-black/50 hover:bg-blue-500/80'
                          : 'bg-white/50 hover:bg-blue-500/80'
                      }`}
                      onClick={() => handlePlaySong(song)}
                    >
                      <Play size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 