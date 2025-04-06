import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { EXPO_PUBLIC_SPOTIFY_CLIENT_ID } from '@env';
import { exchangeCodeForToken } from '../utils/spotify';

WebBrowser.maybeCompleteAuthSession();

const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
].join(' ');

export default function AuthScreen() {
  const router = useRouter();

  const redirectUri = makeRedirectUri({
    scheme: 'your-app-scheme',
    path: 'spotify-auth-callback',
  });

  const handleLogin = async () => {
    try {
      const authUrl = `${AUTH_ENDPOINT}?client_id=${EXPO_PUBLIC_SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent(
        SCOPES
      )}&response_type=code&show_dialog=true`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success') {
        const code = result.url.split('code=')[1];
        // Exchange code for access token
        await exchangeCodeForToken(code);
        router.replace('/playlist');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Music App</Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login with Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});