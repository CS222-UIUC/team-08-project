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
const ngrok_url = "https://a20f-130-126-255-168.ngrok-free.app";

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

      // Then use the token to fetch playlists from Spotify API
      const response = await fetch(`${ngrok_url}/getPlaylists`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Ngrok-Skip-Browser-Warning": "true",
        },
      });
      const data = await response.json();

      // Transform the Spotify API response to match our Playlist type
      const formattedPlaylists: Playlist[] = Array.isArray(data) //changed item from any to unknwon for linter checks
        ? data.map((item: unknown) => {
            const playlist = item as {
              id: string;
              name: string;
              images?: { url: string }[];
              tracks: { total: number };
            };
            return {
              id: playlist.id,
              name: playlist.name,
              imageUrl:
                playlist.images && playlist.images.length > 0
                  ? playlist.images[0].url
                  : "https://misc.scdn.co/liked-songs/liked-songs-300.png",
              tracks: playlist.tracks.total,
            };
          })
        : [];

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
    paddingTop: 80
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
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
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
    borderRadius: 15,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#32CD32",
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
