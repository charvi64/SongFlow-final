import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledQueue, setShuffledQueue] = useState([]);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const playSong = (song, songList = []) => {
    setCurrentSong(song);
    setQueue(songList);
    setQueueIndex(songList.findIndex(s => s.id === song.id));
    if (isShuffle) {
      const shuffled = shuffleArray(songList);
      const currentIndex = shuffled.findIndex(s => s.id === song.id);
      if (currentIndex !== -1) {
        // Move current song to the start of shuffled queue
        shuffled.splice(currentIndex, 1);
        shuffled.unshift(song);
      }
      setShuffledQueue(shuffled);
    }
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
    if (!isShuffle && queue.length > 0) {
      const shuffled = shuffleArray(queue);
      const currentIndex = shuffled.findIndex(s => s.id === currentSong?.id);
      if (currentIndex !== -1) {
        shuffled.splice(currentIndex, 1);
        shuffled.unshift(currentSong);
      }
      setShuffledQueue(shuffled);
    }
  };

  const playNext = () => {
    if (!queue.length) return;

    if (isRepeat && currentSong) {
      // If repeat is on, play the same song again
      setIsPlaying(true);
      return;
    }

    if (isShuffle) {
      const currentShuffleIndex = shuffledQueue.findIndex(s => s.id === currentSong?.id);
      if (currentShuffleIndex < shuffledQueue.length - 1) {
        const nextSong = shuffledQueue[currentShuffleIndex + 1];
        setCurrentSong(nextSong);
        setQueueIndex(queue.findIndex(s => s.id === nextSong.id));
        setIsPlaying(true);
      } else if (isRepeat) {
        // If at the end of shuffled queue and repeat is on, reshuffle and start over
        const newShuffled = shuffleArray(queue);
        setShuffledQueue(newShuffled);
        setCurrentSong(newShuffled[0]);
        setQueueIndex(queue.findIndex(s => s.id === newShuffled[0].id));
        setIsPlaying(true);
      }
    } else {
      if (queueIndex < queue.length - 1) {
        const nextSong = queue[queueIndex + 1];
        setCurrentSong(nextSong);
        setQueueIndex(queueIndex + 1);
        setIsPlaying(true);
      } else if (isRepeat) {
        // If at the end of queue and repeat is on, start over
        setCurrentSong(queue[0]);
        setQueueIndex(0);
        setIsPlaying(true);
      }
    }
  };

  const playPrevious = () => {
    if (!queue.length) return;

    if (isShuffle) {
      const currentShuffleIndex = shuffledQueue.findIndex(s => s.id === currentSong?.id);
      if (currentShuffleIndex > 0) {
        const previousSong = shuffledQueue[currentShuffleIndex - 1];
        setCurrentSong(previousSong);
        setQueueIndex(queue.findIndex(s => s.id === previousSong.id));
        setIsPlaying(true);
      }
    } else {
      if (queueIndex > 0) {
        const previousSong = queue[queueIndex - 1];
        setCurrentSong(previousSong);
        setQueueIndex(queueIndex - 1);
        setIsPlaying(true);
      }
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(-1);
    setCurrentSong(null);
    setShuffledQueue([]);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        queueIndex,
        isPlaying,
        isRepeat,
        isShuffle,
        playSong,
        playNext,
        playPrevious,
        clearQueue,
        togglePlay,
        toggleRepeat,
        toggleShuffle
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}; 