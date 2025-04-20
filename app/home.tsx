import React, { useRef, useState, useEffect } from "react";
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
import { Audio } from 'expo-av';

const ngrok_url = "https://036e-130-126-255-168.ngrok-free.app";
var songID = "";

export default function Home() {
  const { playlistId, playlistName } = useLocalSearchParams();
  const sound = useRef<Audio.Sound | null>(null);
  
  // Pan animation for the entire page content
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeOpacity = useRef(new Animated.Value(0)).current;
  
  // State for all dynamic content
  const [songData, setSongData] = useState({
    title: "Tweaker",
    artist: "GELO",
    image: "https://example.com/placeholder-album-art.jpg",
    startTime: "0:00",
    endTime: "2:52",
    previewUrl:"",
    song_id: "0000"
  });

  const addToPlayList = async (songID: string) => {
    try {
      const response = await fetch(`${ngrok_url}/addToPlaylist?playlist_id=${playlistId}&song_id=${songID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Ngrok-Skip-Browser-Warning": "true",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    catch (error) {
      console.log("Error getting next song:", error);
    }
  };
  
  useEffect(() => {
    console.log("Updated songData:", songData.song_id);
  }, [songData]);


  // State for loading
  const getNextSong = async () => {
    try {
      // 1. Get the next song info from your backend
      const response = await fetch(`${ngrok_url}/getNextSong?playlist_id=${playlistId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Ngrok-Skip-Browser-Warning": "true",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const { title, artist, imageURL, song_id } = data;
      songID = song_id;
      console.log("SONG ID: "+ songID);
  
      // 2. Search for the song on Deezer using title and artist
      // Use both for better accuracy
      const deezerSearchUrl = `https://api.deezer.com/search?q=track:"${encodeURIComponent(title)}" artist:"${encodeURIComponent(artist)}"`;
      const deezerResponse = await fetch(deezerSearchUrl);
      const deezerData = await deezerResponse.json();
  
      let previewUrl = null;
      let image = null;
  
      if (deezerData.data && deezerData.data.length > 0) {
        // Take the first result as the best match
        const track = deezerData.data[0];
        previewUrl = track.preview; // 30s MP3 preview
        image = track.album && track.album.cover_medium; // Album cover
      }
      
      console.log('Preview URL:', previewUrl);
      if (previewUrl) {
        playPreview(previewUrl);
      }
      // 3. Update your state with the new info
      await setSongData(prev => ({
        ...prev,
        title,
        artist,
        image: image || data.image, // fallback to backend image if Deezer doesn't have one
        previewUrl,
        song_id
      }));

      // console.log("NEW SONG ID: " + songData.song_id)
    } catch (error) {
      console.log("Error getting next song:", error);
    }
  };
  

  useEffect(() => {
    getNextSong();
  }, []);


  const playPreview = async (url: string) => {
    try {
      if (!url) {
        alert('No preview available for this track.');
        return;
      }
      // Unload previous sound if any
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      sound.current = newSound;
    } catch (e) {
      console.log('Error playing preview:', e);
    }
  };

  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          console.log(`Swiped ${gestureState.dx > 0 ? "right" : "left"}`);

          if(gestureState.dx > 0) {
            addToPlayList(songID);
          }
          Animated.timing(pan, {
            toValue: { x: gestureState.dx > 0 ? 300 : -300, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            swipeOpacity.setValue(0);
            getNextSong();
          });
          
          return;
        }
        
        // Reset if not a strong enough swipe
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.timing(swipeOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          })
        ]).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(evt, gestureState);
        const opacity = Math.min(Math.abs(gestureState.dx) / 200, 0.5);
        swipeOpacity.setValue(opacity);
      },
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
          styles.pageContent,
          { transform: [{ translateX: pan.x }] },
          {
            backgroundColor: pan.x.interpolate({
              inputRange: [-300, -100, 0, 100, 300],
              outputRange: ['rgba(255, 0, 0, 0.6)', 'rgba(255, 0, 0, 0.4)', '#FFFFFF', 'rgba(0, 255, 0, 0.4)', 'rgba(0, 255, 0, 0.6)'],
            })
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.albumArtContainer}>
          <Image
            source={{ uri: songData.image}}
            style={styles.albumArt}
          />
        </View>

        <Text style={styles.songTitle}>{songData.title}</Text>
        <Text style={styles.artistName}>{songData.artist}</Text>

        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>{songData.startTime}</Text>
          <Text style={styles.timeText}>{songData.endTime}</Text>
        </View>

        <View style={styles.controlsWrapper}>
          <View style={styles.swipeHintLeft}>
            <Ionicons name="chevron-back" size={20} color="#FF0000" />
            <Text style={styles.swipeHintText}>No</Text>
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
          
          <View style={styles.swipeHintRight}>
            <Text style={styles.swipeHintText}>Yes</Text>
            <Ionicons name="chevron-forward" size={20} color="#00FF00" />
          </View>
        </View>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.swipeIndicatorLeft, 
          { 
            opacity: Animated.multiply(
              swipeOpacity,
              pan.x.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              })
            )
          }
        ]}
      >
        <Text style={styles.swipeIndicatorText}>No</Text>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.swipeIndicatorRight, 
          { 
            opacity: Animated.multiply(
              swipeOpacity,
              pan.x.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 1],
                extrapolate: 'clamp'
              })
            )
          }
        ]}
      >
        <Text style={styles.swipeIndicatorText}>Yes</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 40,
    position: "relative",
  },
  pageContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
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
    position: "relative",
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
  controlsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  playButton: {
    backgroundColor: "#000000",
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 20,
  },
  swipeIndicatorLeft: {
    position: 'absolute',
    backgroundColor: '#C01A1A',
    padding: 10,
    borderRadius: 10,
    left: 20,
    top: '50%',
  },
  swipeIndicatorRight: {
    position: 'absolute',
    backgroundColor: '#32CD32',
    padding: 10,
    borderRadius: 10,
    right: 20,
    top: '50%',
  },
  swipeIndicatorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  swipeHintContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    bottom: 10,
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  swipeHintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  swipeHintRight: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  swipeHintText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 5,
    color: "#000000",
  },
});
