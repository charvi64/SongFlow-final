import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2 } from 'lucide-react';
import { useSpotify } from '../services/spotify';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [currentTrack, setCurrentTrack] = useState(null);
  const { player } = useSpotify();

  useEffect(() => {
    if (!player) return;

    player.addListener('player_state_changed', (state) => {
      if (!state) return;

      setCurrentTrack(state.track_window.current_track);
      setIsPlaying(!state.paused);
      setProgress((state.position / state.duration) * 100);
    });

    return () => {
      player.removeListener('player_state_changed');
    };
  }, [player]);

  const togglePlay = () => {
    if (!player) return;
    player.togglePlay();
  };

  const skipNext = () => {
    if (!player) return;
    player.nextTrack();
  };

  const skipPrevious = () => {
    if (!player) return;
    player.previousTrack();
  };

  return (
    <div className="h-20 bg-gray-900 border-t border-gray-800 text-white px-4">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center w-1/4">
          {currentTrack && (
            <>
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.album.name}
                className="h-14 w-14 rounded-md object-cover"
              />
              <div className="ml-4">
                <div className="text-sm font-medium">{currentTrack.name}</div>
                <div className="text-xs text-gray-400">{currentTrack.artists[0].name}</div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center gap-4">
            <button 
              className="text-gray-400 hover:text-white transition"
              onClick={skipPrevious}
            >
              <SkipBack size={20} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              className="text-gray-400 hover:text-white transition"
              onClick={skipNext}
            >
              <SkipForward size={20} />
            </button>
            <button className="text-gray-400 hover:text-white transition">
              <Repeat size={20} />
            </button>
          </div>
          <div className="w-full flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">2:30</span>
            <div className="flex-1 h-1 bg-gray-600 rounded-full">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">4:15</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-1/4 justify-end">
          <Volume2 size={20} className="text-gray-400" />
          <div className="w-24 h-1 bg-gray-600 rounded-full">
            <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 