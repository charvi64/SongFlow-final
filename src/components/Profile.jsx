import React, { useState } from 'react';
import { Clock, Users, Music, Calendar, Edit2, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Profile() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - In a real app, this would come from your backend
  const userStats = {
    minutesListened: 12460,
    friendsCount: 45,
    playlistsCount: 12,
    joinDate: '2024-01-15',
    topArtists: ['The Weekend', 'Taylor Swift', 'Drake', 'Ed Sheeran', 'Coldplay'],
    recentlyPlayed: [
      {
        name: 'Blinding Lights',
        artist: 'The Weekend',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
      },
      {
        name: 'Anti-Hero',
        artist: 'Taylor Swift',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      },
      {
        name: 'Rich Flex',
        artist: 'Drake',
        imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300',
      },
    ],
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes % 60}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="relative mb-8">
        <div className="h-48 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center border-4 ${isDarkMode ? 'border-black' : 'border-white'}`}>
              <UserIcon size={64} className="text-gray-400" />
            </div>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <h1 className="text-3xl font-bold">{user?.username}</h1>
            <button
              onClick={() => setIsEditing(true)}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-purple-500" size={24} />
            <h3 className="font-semibold">Listening Time</h3>
          </div>
          <p className="text-2xl font-bold">{formatMinutes(userStats.minutesListened)}</p>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-purple-500" size={24} />
            <h3 className="font-semibold">Friends</h3>
          </div>
          <p className="text-2xl font-bold">{userStats.friendsCount}</p>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Music className="text-purple-500" size={24} />
            <h3 className="font-semibold">Playlists</h3>
          </div>
          <p className="text-2xl font-bold">{userStats.playlistsCount}</p>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-purple-500" size={24} />
            <h3 className="font-semibold">Joined</h3>
          </div>
          <p className="text-2xl font-bold">{formatDate(userStats.joinDate)}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <h3 className="text-xl font-bold mb-4">Top Artists</h3>
          <div className="space-y-4">
            {userStats.topArtists.map((artist, index) => (
              <div
                key={artist}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  isDarkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-200'
                } transition-colors cursor-pointer`}
              >
                <span className="text-lg font-bold text-purple-500">#{index + 1}</span>
                <span className="font-medium">{artist}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <h3 className="text-xl font-bold mb-4">Recently Played</h3>
          <div className="space-y-4">
            {userStats.recentlyPlayed.map((track) => (
              <div
                key={track.name}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  isDarkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-200'
                } transition-colors cursor-pointer`}
              >
                <img
                  src={track.imageUrl}
                  alt={track.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium">{track.name}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  defaultValue={user?.username}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-gray-100 border-gray-300'
                  } border`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-gray-100 border-gray-300'
                  } border`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profile Picture</label>
                <div className={`flex items-center gap-4 p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                } cursor-pointer`}>
                  <UserIcon size={24} className="text-gray-400" />
                  <span className="text-sm">Upload new picture</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 