import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

export default function Home() {
  const { playlistId, playlistName } = useLocalSearchParams();

  // State for all dynamic content
  const [songData, setSongData] = useState({
    title: "Tweaker",
    artist: "GELO",
    startTime: "1:04",
    endTime: "2:52",
  });

  // PanResponder for swipe gestures
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          // Swipe detected - update all fields
          setSongData({
            title: "Song Title",
            artist: "Artist Name",
            startTime: "Start",
            endTime: "End",
          });
          console.log(`Swiped ${gestureState.dx > 0 ? "right" : "left"}`);
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
    }),
  ).current;

  // finding similar songs
  console.log("Selected playlist:", playlistId, playlistName);

  return (
    <View style={styles.container}>
      <Text style={styles.playlistName}>Similar to: {playlistName}</Text>

      {/* <TouchableOpacity style={styles.importButton}>
        <Text style={styles.importButtonText}>Import Song/Playlist</Text>
      </TouchableOpacity> */}

      <Animated.View
        style={[
          styles.albumArtContainer,
          { transform: [{ translateX: pan.x }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: "https://example.com/placeholder-album-art.jpg" }}
          style={styles.albumArt}
        />
      </Animated.View>

      <Text style={styles.songTitle}>{songData.title}</Text>
      <Text style={styles.artistName}>{songData.artist}</Text>

      <View style={styles.progressBar}>
        <View style={styles.progress} />
      </View>

      <View style={styles.timeInfo}>
        <Text style={styles.timeText}>{songData.startTime}</Text>
        <Text style={styles.timeText}>{songData.endTime}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity>
          <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.noButton]}>
          <Text style={[styles.actionButtonText, styles.noButtonText]}>No</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.yesButton]}>
          <Text style={styles.actionButtonText}>Yes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 40,
  },
  playlistName: {
    fontSize: 18,
    color: "#000000",
    marginBottom: 20,
  },
  albumArtContainer: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
  },
  albumArt: {
    width: "100%",
    height: "100%",
  },
  songTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  artistName: {
    fontSize: 18,
    color: "#888888",
    marginBottom: 20,
  },
  progressBar: {
    width: "80%",
    height: 4,
    backgroundColor: "#EEEEEE",
    borderRadius: 2,
    marginBottom: 10,
  },
  progress: {
    width: "40%",
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  timeText: {
    color: "#888888",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  playButton: {
    backgroundColor: "#000000",
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  actionButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
  },
  noButton: {
    backgroundColor: "#000000",
    borderColor: "transparent",
  },
  yesButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
  },
  actionButtonText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  noButtonText: {
    color: "#FFFFFF",
  },
  yesButtonText: {
    color: "#000000",
  },
});
