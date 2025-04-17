import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth related functions
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Playlist related functions
export const createPlaylist = async (name, description) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication error');
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating playlist for user:', user.id);
    
    const { data, error } = await supabase
      .from('playlists')
      .insert([
        {
          name,
          description,
          user_id: user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Playlist created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createPlaylist:', error);
    throw error;
  }
};

export const updatePlaylist = async (playlistId, { name, description }) => {
  const { data, error } = await supabase
    .from('playlists')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', playlistId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePlaylist = async (playlistId) => {
  try {
    // First delete all songs in the playlist
    const { error: deleteSongsError } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId);
    
    if (deleteSongsError) throw deleteSongsError;
    
    // Then delete the playlist itself
    const { error: deletePlaylistError } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);
    
    if (deletePlaylistError) throw deletePlaylistError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return { success: false, error: error.message };
  }
};

export const getUserPlaylists = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return { data: [], error: 'Authentication error' };
    }
    
    if (!user) {
      return { data: [], error: 'User not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return { data: [], error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserPlaylists:', error);
    return { data: [], error: error.message };
  }
};

export const getPlaylistDetails = async (playlistId) => {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_songs (
        *,
        songs:song_id (*)
      )
    `)
    .eq('id', playlistId)
    .single();

  if (error) throw error;
  return {
    ...data,
    songs: data.playlist_songs.map(ps => ps.songs)
  };
};

// Song related functions
export const getAllSongs = async () => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('title');

    if (error) {
      console.error('Error fetching songs:', error);
      return [];
    }

    console.log('Songs from database:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const searchSongs = async (query) => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`)
    .order('title', { ascending: true });

  if (error) throw error;
  return data;
};

// Playlist-Song management functions
export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication error');
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if the song is already in the playlist
    const { data: existingSong } = await supabase
      .from('playlist_songs')
      .select()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)
      .single();

    if (existingSong) {
      throw new Error('Song already exists in playlist');
    }

    const { data, error } = await supabase
      .from('playlist_songs')
      .insert([{ 
        playlist_id: playlistId, 
        song_id: songId,
        added_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addSongToPlaylist:', error);
    throw error;
  }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .match({ playlist_id: playlistId, song_id: songId });

  if (error) throw error;
};

export const getPlaylistSongs = async (playlistId) => {
  const { data, error } = await supabase
    .from('playlist_songs')
    .select(`
      *,
      songs:song_id (*)
    `)
    .eq('playlist_id', playlistId)
    .order('added_at', { ascending: true });

  if (error) throw error;
  return data.map(item => item.songs);
};

// Like related functions
export const toggleLikeSong = async (songId) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if song is already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select()
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .single();

  if (existingLike) {
    // Unlike the song
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId);

    if (error) throw error;
    return false;
  } else {
    // Like the song
    const { error } = await supabase
      .from('likes')
      .insert([{ user_id: user.id, song_id: songId }]);

    if (error) throw error;
    return true;
  }
};

export const getLikedSongs = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('likes')
    .select('song_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return data.map(like => like.song_id);
};

export const checkIfSongIsLiked = async (songId) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('likes')
    .select()
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is the "not found" error code
  return !!data;
};

export const uploadSong = async (songData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication error');
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First, upload the song file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('songs')
      .upload(`${user.id}/${Date.now()}-${songData.file.name}`, songData.file);

    if (uploadError) {
      console.error('Error uploading song:', uploadError);
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('songs')
      .getPublicUrl(uploadData.path);

    // Insert the song data into the songs table
    const { data, error } = await supabase
      .from('songs')
      .insert([{
        title: songData.title,
        artist: songData.artist,
        album: songData.album,
        song_url: publicUrl,
        cover_url: songData.cover_url,
        duration: songData.duration,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating song record:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in uploadSong:', error);
    throw error;
  }
}; 