import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

export default function Home() {
  const { playlistId, playlistName } = useLocalSearchParams();

  // finding similar songs
  console.log("Selected playlist:", playlistId, playlistName);

  return (
    <View style={styles.container}>
      <Text style={styles.playlistName}>Similar to: {playlistName}</Text>

      {/* <TouchableOpacity style={styles.importButton}>
        <Text style={styles.importButtonText}>Import Song/Playlist</Text>
      </TouchableOpacity> */}

      <View style={styles.albumArtContainer}>
        <Image
          source={{ uri: 'https://example.com/placeholder-album-art.jpg' }}
          style={styles.albumArt}
        />
      </View>

      <Text style={styles.songTitle}>Tweaker</Text>
      <Text style={styles.artistName}>GELO</Text>

      <View style={styles.progressBar}>
        <View style={styles.progress} />
      </View>

      <View style={styles.timeInfo}>
        <Text style={styles.timeText}>1:04</Text>
        <Text style={styles.timeText}>2:52</Text>
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
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  paddingTop: 40,
  },
  playlistName: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 20,
  },
  // importButton: {
  // backgroundColor: '#EEEEEE',
  // paddingHorizontal: 20,
  // paddingVertical: 10,
  // borderRadius: 20,
  // marginBottom: 20,
  // },
  // importButtonText: {
  // color: '#000000',
  // fontWeight: 'bold',
  // },
  albumArtContainer: {
  width: 300,
  height: 300,
  borderRadius: 20,
  overflow: 'hidden',
  marginBottom: 20,
  },
  albumArt: {
  width: '100%',
  height: '100%',
  },
  songTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 5,
  },
  artistName: {
  fontSize: 18,
  color: '#888888',
  marginBottom: 20,
  },
  progressBar: {
  width: '80%',
  height: 4,
  backgroundColor: '#EEEEEE',
  borderRadius: 2,
  marginBottom: 10,
  },
  progress: {
  width: '40%',
  height: '100%',
  backgroundColor: '#000000',
  borderRadius: 2,
  },
  timeInfo: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '80%',
  marginBottom: 20,
  },
  timeText: {
  color: '#888888',
  },
  controls: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 30,
  },
  playButton: {
  backgroundColor: '#000000',
  borderRadius: 30,
  padding: 10,
  marginHorizontal: 20,
  },
  actionButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '80%',
  },
  actionButton: {
  paddingHorizontal: 40,
  paddingVertical: 15,
  borderRadius: 25,
  borderWidth: 2,
  },
  noButton: {
  backgroundColor: '#000000',
  borderColor: 'transparent',
  },
  yesButton: {
  backgroundColor: '#FFFFFF',
  borderColor: '#000000',
  },
  actionButtonText: {
  fontWeight: 'bold',
  fontSize: 18,
  },
  noButtonText: {
  color: '#FFFFFF',
  },
  yesButtonText: {
  color: '#000000',
  }
  });