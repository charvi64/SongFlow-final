import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const { isDarkMode } = useTheme();
  const {
    currentSong,
    isPlaying,
    isRepeat,
    isShuffle,
    togglePlay,
    toggleRepeat,
    toggleShuffle,
    playNext,
    playPrevious
  } = usePlayer();

  // Cleanup function to stop and reset audio
  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      setCurrentTime(0);
      setDuration(0);
      setIsAudioReady(false);
      setError(null);
    }
  };

  // Reset audio state when song changes
  useEffect(() => {
    cleanupAudio();
    return () => cleanupAudio();
  }, [currentSong]);

  // Handle audio loading and playback
  useEffect(() => {
    if (!currentSong) return;

    let isMounted = true;

    const loadAndPlayAudio = async () => {
      try {
        setIsLoading(true);
        setIsAudioReady(false);
        setError(null);

        // Clean up any existing audio
        cleanupAudio();
        
        const audioUrl = currentSong.url;
        
        if (!audioUrl) {
          throw new Error(`No audio URL provided for song: ${currentSong.title}`);
        }
        
        const audio = new Audio();
        audioRef.current = audio;
        
        const handleCanPlay = () => {
          if (!isMounted) return;
          setIsLoading(false);
          setIsAudioReady(true);
          setError(null);
          if (isPlaying) {
            audio.play().catch(e => {
              console.error('Play failed:', e);
              if (isMounted) {
                setError('Failed to play audio');
                setIsPlaying(false);
              }
            });
          }
        };

        const handleError = (e) => {
          console.error('Audio loading error:', e);
          if (!isMounted) return;
          if (!audio.currentTime && !audio.duration) {
            setError('Failed to load audio file');
          }
          setIsLoading(false);
          setIsAudioReady(false);
        };

        const handleTimeUpdate = () => {
          if (!isMounted) return;
          setCurrentTime(audio.currentTime);
          if (error) {
            setError(null);
          }
        };

        const handleLoadedMetadata = () => {
          if (!isMounted) return;
          setDuration(audio.duration);
        };

        const handleEnded = () => {
          if (!isMounted) return;
          if (isRepeat) {
            audio.currentTime = 0;
            audio.play();
          } else {
            playNext();
          }
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        // Set initial volume
        audio.volume = isMuted ? 0 : volume;
        audio.src = audioUrl;
        audio.load();

        return () => {
          isMounted = false;
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('ended', handleEnded);
          cleanupAudio();
        };
      } catch (error) {
        console.error("Audio setup failed:", error);
        if (isMounted) {
          setError(error.message);
          setIsLoading(false);
          setIsAudioReady(false);
        }
      }
    };

    loadAndPlayAudio();
    return () => {
      isMounted = false;
      cleanupAudio();
    };
  }, [currentSong, isPlaying, playNext, isRepeat, volume, isMuted]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !isAudioReady) return;

    const playAudio = async () => {
      try {
        if (isPlaying) {
          await audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        setError('Failed to play audio');
      }
    };

    playAudio();
  }, [isPlaying, isAudioReady]);

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setVolume(volume || 0.5);
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current && isAudioReady) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleProgressBarClick = (e) => {
    if (!audioRef.current || !isAudioReady) return;
    
    const progressBar = e.currentTarget;
    const bounds = progressBar.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const width = bounds.width;
    const percentage = x / width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  if (!currentSong) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-4 flex items-center justify-between z-50`}>
      <div className="flex items-center w-1/4">
        <img
          src={currentSong.cover_url || 'https://placehold.co/400x400?text=No+Cover'}
          alt={currentSong.title}
          className="h-14 w-14 rounded-md object-cover"
        />
        <div className="ml-4">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentSong.title}
          </div>
          <div className="text-xs text-gray-500">{currentSong.artist}</div>
        </div>
      </div>

      <div className="flex flex-col items-center w-2/4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`text-gray-400 hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition ${
              isShuffle ? (isDarkMode ? 'text-purple-500' : 'text-blue-500') : ''
            }`}
            disabled={!isAudioReady}
          >
            <Shuffle size={20} />
          </button>
          <button
            onClick={playPrevious}
            className={`text-gray-400 hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition ${!isAudioReady && 'opacity-50 cursor-not-allowed'}`}
            disabled={!isAudioReady}
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              !isAudioReady
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            } transition-all duration-200`}
            disabled={!isAudioReady}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={playNext}
            className={`text-gray-400 hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition ${!isAudioReady && 'opacity-50 cursor-not-allowed'}`}
            disabled={!isAudioReady}
          >
            <SkipForward size={20} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`text-gray-400 hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition ${
              isRepeat ? (isDarkMode ? 'text-purple-500' : 'text-blue-500') : ''
            }`}
            disabled={!isAudioReady}
          >
            <Repeat size={20} />
          </button>
        </div>
        <div className="w-full flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div 
            className="flex-1 relative h-1 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div
              className={`absolute h-full rounded-full ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute w-full h-full opacity-0 cursor-pointer"
              style={{ top: 0, left: 0 }}
            />
          </div>
          <span className="text-xs text-gray-400 w-12">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-1/4 justify-end">
        <button
          onClick={toggleMute}
          className={`text-gray-400 hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition`}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <div className="relative w-24 h-1 bg-gray-600 rounded-full">
          <div
            className={`absolute h-full rounded-full ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}
            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="absolute w-full h-full opacity-0 cursor-pointer"
            style={{ top: 0, left: 0 }}
          />
        </div>
      </div>

      {error && !currentTime && !isPlaying && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="bg-red-500 text-white px-4 py-2 rounded-t-lg text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
} 