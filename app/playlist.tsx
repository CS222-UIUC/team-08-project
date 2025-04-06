import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from "expo-router";
import { getSpotifyApi } from '../utils/spotify';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
}

export default function Playlists() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = async () => {
    try {
      const spotifyApi = await getSpotifyApi();
      const response = await spotifyApi.getUserPlaylists();
      setPlaylists(response.body.items);
      setLoading(false);
    } catch (err) {
      setError('Failed to load playlists');
      setLoading(false);
      console.error('Error fetching playlists:', err);
    }
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    router.push({
      pathname: "/home",
      params: { playlistId: playlist.id, playlistName: playlist.name }
    });
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity 
      style={styles.playlistItem} 
      onPress={() => handlePlaylistSelect(item)}
    >
      <Image 
        source={{ 
          uri: item.images[0]?.url || 'https://misc.scdn.co/liked-songs/liked-songs-300.png'
        }} 
        style={styles.playlistImage}
      />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistTracks}>{item.tracks.total} tracks</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={[styles.subtitle, { marginTop: 20 }]}>Loading your playlists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchUserPlaylists}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Playlists</Text>
      <Text style={styles.subtitle}>Select a playlist to find similar songs</Text>
      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 15,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playlistTracks: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});