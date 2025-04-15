import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ListRenderItem,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

// Define the Playlist type
type Playlist = {
  id: string;
  name: string;
  imageUrl: string;
  tracks: number;
};

// Define ngrok URL - make sure this matches the one in index.tsx
const ngrok_url = "https://b070-130-126-255-92.ngrok-free.app";

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
      setLoading(true);
      
      // First, get the access token from our server
      const tokenResponse = await fetch(`${ngrok_url}/getToken`, {
        headers: {
          "Ngrok-Skip-Browser-Warning": "true",
        },
      });
      const accessToken = await tokenResponse.text();
      
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }
      
      // Then use the token to fetch playlists from Spotify API
      const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Failed to fetch playlists");
      }
      
      // Transform the Spotify API response to match our Playlist type
      const formattedPlaylists: Playlist[] = data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.images && item.images.length > 0 ? item.images[0].url : "https://misc.scdn.co/liked-songs/liked-songs-300.png",
        tracks: item.tracks.total,
      }));
      
      setPlaylists(formattedPlaylists);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setError(err instanceof Error ? err.message : "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    router.push({
      pathname: "/home",
      params: { playlistId: playlist.id, playlistName: playlist.name },
    });
  };

  const renderPlaylistItem: ListRenderItem<Playlist> = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handlePlaylistSelect(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.playlistImage} />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistTracks}>{item.tracks} tracks</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#32CD32" />
        <Text style={styles.loadingText}>Loading your playlists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error: {error}</Text>
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
      <Text style={styles.subtitle}>
        Select a playlist to find similar songs
      </Text>
      {playlists.length === 0 ? (
        <Text style={styles.noPlaylistsText}>No playlists found</Text>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#AAAAAA",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF5252",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  noPlaylistsText: {
    color: "#AAAAAA",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#32CD32",
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
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  playlistTracks: {
    fontSize: 14,
    color: "#AAAAAA",
  },
});