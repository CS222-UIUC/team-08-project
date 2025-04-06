import SpotifyWebApi from 'spotify-web-api-node';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_SPOTIFY_CLIENT_ID, EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET } from '@env';

const spotifyApi = new SpotifyWebApi({
  clientId: EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET,
  redirectUri: 'your-app-scheme://spotify-auth-callback',
});

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  timestamp: number;
}

export const exchangeCodeForToken = async (code: string) => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${EXPO_PUBLIC_SPOTIFY_CLIENT_ID}:${EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'your-app-scheme://spotify-auth-callback',
      }).toString(),
    });

    const data = await response.json();
    
    if (response.ok) {
      await saveTokenInfo({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        timestamp: Date.now(),
      });
      return data.access_token;
    } else {
      throw new Error(data.error_description || 'Failed to exchange code for token');
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${EXPO_PUBLIC_SPOTIFY_CLIENT_ID}:${EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    const data = await response.json();
    
    if (response.ok) {
      await saveTokenInfo({
        accessToken: data.access_token,
        refreshToken: refreshToken,
        expiresIn: data.expires_in,
        timestamp: Date.now(),
      });
      return data.access_token;
    } else {
      throw new Error(data.error_description || 'Failed to refresh token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

const saveTokenInfo = async (tokenInfo: TokenInfo) => {
  await AsyncStorage.setItem('spotifyTokenInfo', JSON.stringify(tokenInfo));
};

export const getAccessToken = async () => {
  try {
    const tokenInfoStr = await AsyncStorage.getItem('spotifyTokenInfo');
    if (!tokenInfoStr) return null;

    const tokenInfo: TokenInfo = JSON.parse(tokenInfoStr);
    const now = Date.now();
    const isExpired = now - tokenInfo.timestamp > tokenInfo.expiresIn * 1000;

    if (isExpired) {
      const newAccessToken = await refreshAccessToken(tokenInfo.refreshToken);
      return newAccessToken;
    }

    return tokenInfo.accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getSpotifyApi = async () => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('No access token found');
  }
  spotifyApi.setAccessToken(accessToken);
  return spotifyApi;
};