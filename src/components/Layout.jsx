import React from 'react';
import Sidebar from './Sidebar';
import AudioPlayer from './AudioPlayer';
import { usePlayer } from '../contexts/PlayerContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout({ children }) {
  const { currentSong, playNext, playPrevious } = usePlayer();
  const { isDarkMode } = useTheme();

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-black text-white'
            : 'bg-gradient-to-br from-blue-50 via-blue-100 to-white text-gray-900'
        }`}>
          {children}
        </main>
      </div>
      <AudioPlayer
        song={currentSong}
        onNext={playNext}
        onPrevious={playPrevious}
      />
    </div>
  );
} 