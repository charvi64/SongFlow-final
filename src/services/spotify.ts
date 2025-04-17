import { useEffect, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-library-modify",
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative"
];

export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;

export const getAccessTokenFromUrl = () => {
  const hash = window.location.hash;
  if (!hash) return null;
  
  const token = hash
    .substring(1)
    .split("&")
    .find(elem => elem.startsWith("access_token"))
    ?.split("=")[1];

  window.location.hash = "";
  return token;
};

export const useSpotify = () => {
  const [token, setToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    const token = getAccessTokenFromUrl() || localStorage.getItem("spotify_token");
    if (token) {
      setToken(token);
      localStorage.setItem("spotify_token", token);
      initializePlayer(token);
    }
  }, []);

  const initializePlayer = async (token: string) => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'SoNgFloW Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setPlayer(player);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.connect();
    };
  };

  const getFeaturedTracks = async () => {
    if (!token) return null;
    
    try {
      const response = await fetch('https://api.spotify.com/v1/browse/featured-playlists', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.playlists && data.playlists.items.length > 0) {
        const playlistId = data.playlists.items[0].id;
        const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=5`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const tracksData = await tracksResponse.json();
        return tracksData.items.map((item: any) => item.track);
      }
      return null;
    } catch (error) {
      console.error("Error fetching featured tracks:", error);
      return null;
    }
  };

  const getPlaylistTracks = async (playlistId: string) => {
    if (!token) return null;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.items.map((item: any) => item.track);
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
      return null;
    }
  };

  const searchTracks = async (query: string) => {
    if (!token) return null;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error("Error searching tracks:", error);
      return null;
    }
  };

  const playTrack = async (uri: string) => {
    if (!player) return;
    
    try {
      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [uri],
        }),
      });
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const addToLikedSongs = async (trackId: string) => {
    if (!token) return;
    
    try {
      await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error adding to liked songs:", error);
    }
  };

  const removeFromLikedSongs = async (trackId: string) => {
    if (!token) return;
    
    try {
      await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error removing from liked songs:", error);
    }
  };

  const checkIfTrackIsLiked = async (trackId: string) => {
    if (!token) return false;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const [isLiked] = await response.json();
      return isLiked;
    } catch (error) {
      console.error("Error checking if track is liked:", error);
      return false;
    }
  };

  return {
    token,
    player,
    searchTracks,
    playTrack,
    addToLikedSongs,
    removeFromLikedSongs,
    checkIfTrackIsLiked,
    getFeaturedTracks,
    getPlaylistTracks,
  };
};