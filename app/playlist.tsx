import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

// Mock data for playlists
const ngrok_url = "https://29fb-130-126-255-168.ngrok-free.app";

const mockPlaylists = [
  {
    id: "1",
    name: "Liked Songs",
    imageUrl: "https://misc.scdn.co/liked-songs/liked-songs-300.png",
    tracks: 124,
  },
  {
    id: "2",
    name: "Chill Vibes",
    imageUrl:
      "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
    tracks: 45,
  },
  {
    id: "3",
    name: "Workout Mix",
    imageUrl:
      "https://i.scdn.co/image/ab67706f000000025f2635e031078672e7b384a5",
    tracks: 32,
  },
  {
    id: "4",
    name: "Party Anthems",
    imageUrl:
      "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
    tracks: 67,
  },
  {
    id: "5",
    name: "Study Focus",
    imageUrl:
      "https://i.scdn.co/image/ab67706f00000002e4eadd417a05b2546e866934",
    tracks: 89,
  },
];

export default function Playlists() {
  const router = useRouter();

  const handlePlaylistSelect = (playlist: { id: any; name: any }) => {
    router.push({
      pathname: "/home",
      params: { playlistId: playlist.id, playlistName: playlist.name },
    });
  };

  const renderPlaylistItem = (item: { id: any; name: any }) => (
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Playlists</Text>
      <Text style={styles.subtitle}>
        Select a playlist to find similar songs
      </Text>
      <FlatList
        data={mockPlaylists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
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
