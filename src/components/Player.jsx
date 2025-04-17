import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { useTheme } from '../hooks/useTheme';
import { BsPlayFill, BsPauseFill, BsRepeat, BsShuffle } from 'react-icons/bs';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import Slider from './Slider';

const Player = () => {
  const { 
    currentSong,
    isPlaying,
    volume,
    setVolume,
    playPause,
    playNext,
    playPrevious 
  } = usePlayer();
  
  const { isDarkMode } = useTheme();
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (currentSong?.song_url) {
      audioRef.current.src = currentSong.song_url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSong]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      const duration = audio.duration;
      const currentTime = audio.currentTime;
      setProgress((currentTime / duration) * 100 || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  const handleProgressChange = (newValue) => {
    const audio = audioRef.current;
    const time = (newValue / 100) * audio.duration;
    audio.currentTime = time;
    setProgress(newValue);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
    audioRef.current.loop = !isRepeat;
  };

  const handleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  if (!currentSong) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${
      isDarkMode 
        ? 'bg-black border-gray-700' 
        : 'bg-white/80 border-blue-100'
    } border-t backdrop-blur-md p-4`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={currentSong.cover_url || 'https://placehold.co/400x400?text=No+Cover'}
            alt={currentSong.title}
            className="w-14 h-14 rounded-md"
          />
          <div>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentSong.title}
            </h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-blue-600'}>
              {currentSong.artist}
            </p>
          </div>
          <button 
            onClick={handleLike}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-blue-100'
            }`}
          >
            {isLiked ? (
              <AiFillHeart size={20} className="text-red-500" />
            ) : (
              <AiOutlineHeart size={20} className={isDarkMode ? 'text-gray-400' : 'text-blue-400'} />
            )}
          </button>
        </div>

        <div className="flex flex-col items-center flex-1 max-w-2xl mx-8">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-blue-100'
              } ${isShuffle ? (isDarkMode ? 'text-purple-500' : 'text-blue-500') : ''}`}
            >
              <BsShuffle size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>

            <button 
              onClick={playPrevious}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-blue-100'
              }`}
            >
              <BiSkipPrevious size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
            </button>
            
            <button 
              onClick={playPause}
              className={`p-3 rounded-full transition-colors ${
                isDarkMode 
                  ? 'bg-white hover:bg-gray-200' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isPlaying ? (
                <BsPauseFill size={24} className={isDarkMode ? 'text-black' : 'text-white'} />
              ) : (
                <BsPlayFill size={24} className={isDarkMode ? 'text-black' : 'text-white'} />
              )}
            </button>

            <button 
              onClick={playNext}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-blue-100'
              }`}
            >
              <BiSkipNext size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
            </button>

            <button 
              onClick={handleRepeat}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-blue-100'
              } ${isRepeat ? (isDarkMode ? 'text-purple-500' : 'text-blue-500') : ''}`}
            >
              <BsRepeat size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
          
          <div className="w-full mt-2">
            <Slider 
              value={progress}
              onChange={handleProgressChange}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-blue-100'
            }`}
          >
            {volume === 0 ? (
              <HiSpeakerXMark size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
            ) : (
              <HiSpeakerWave size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
            )}
          </button>
          <div className="w-24">
            <Slider 
              value={volume * 100}
              onChange={(newValue) => setVolume(newValue / 100)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player; 