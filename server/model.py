import requests
import google.generativeai as genai
from auth import ngrok_url
# from routes import playlist_id
from urllib.parse import urlencode
from db import write_user_genre
import os
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
load_dotenv(dotenv_path, override=True)  

# === CONFIG ===
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
FLASK_SERVER_URL = ngrok_url  # or your actual Flask server URL
playlist_id = ""
# === SETUP ===
genai.configure(api_key=GEMINI_API_KEY)

class GeminiSongQueue:
    def __init__(self):
        self.song_artist_tuples = []
        self.index = 0

    def refill(self, playlist_items):
        # Call Gemini and parse response
        gemini_response = get_gemini_url(playlist_items)
        pairs = gemini_response.split('; ')
        self.song_artist_tuples = [tuple(pair.split('/ ')) for pair in pairs]
        self.index = 0

    def get_next(self, playlist_items):
        # If we've used all songs, refill
        if self.index >= len(self.song_artist_tuples):
            self.refill(playlist_items)
        # Get next song-artist tuple
        song_artist = self.song_artist_tuples[self.index]
        print("song_artist var: ", song_artist)
        self.index += 1
        song_name = song_artist[0]
        print("song_name var: ", song_name)
        artist = song_artist[1]
        return song_name, artist
    

def get_access_token():
    response = requests.get(FLASK_SERVER_URL+"/getToken")
    response.raise_for_status()
    return response.text.strip() 

def get_playlist_id():
    response = requests.get(FLASK_SERVER_URL+"/getPlaylistId")
    response.raise_for_status()
    return response.text.strip() 

# Gemini returns 10 song recs
def get_gemini_url(songs):
    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-001")
    
    song_list_text = "\n".join(
        [f"- '{song['track']['name']}' by {', '.join(artist['name'] for artist in song['track']['artists'])} (ID: {song['track']['id']})" 
         for song in songs if song.get('track')]
    )
    
    prompt = (
        f"Given the following list of songs, recommend **ten** similar songs that fit the overall vibe. "
        f"Use EXACTLY this format (no numbers, no markdown):\n"
        f"Song Name/ Artist Name; Song Name/ Artist Name; ...\n\n"
        f"Songs:\n{song_list_text}"
    )
    
    response = model.generate_content(prompt)
    print("Gemini Raw Response:", response.text)  # Debugging
    return response.text.strip()

#Gemini returns Genre of playlist
def get_gemini_genre(songs):
    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-001")

    song_list_text = "\n".join(
        [f"- '{song['track']['name']}' by {', '.join(artist['name'] for artist in song['track']['artists'])} (ID: {song['track']['id']})"for song in songs if song.get('track')]
    )
    print(song_list_text)
    prompt = (
        f"Given the following list of songs and artists, specify **one** music genre that fits the overall vibe. Give me a one word answer that is just the genre. No special characters just the word."
        f"{song_list_text}\n\n"
    )

    response = model.generate_content(prompt)
    return response.text.strip()


def get_playlist_tracks(playlist_id, token):
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"  # ✅ Correct URL format
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise exception for 4xx/5xx errors
        return response.json()
    except requests.exceptions.HTTPError as err:
        print(f"Spotify API Error: {err}")
        return None


gemini_queue = GeminiSongQueue()

async def main_model(playlist_id):
    try:
        token = get_access_token()
        playlist_data = get_playlist_tracks(playlist_id, token)
    

        # Get next song from queue
        song_name, artist = gemini_queue.get_next(playlist_data['items'])
        print("Song Name from main model: ", song_name)
        # Spotify API call
        response = requests.get(
            "https://api.spotify.com/v1/search",
            params={"q": f'track:"{song_name}" artist:"{artist}"', "type": "track"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code != 200:
            return {"error": "Spotify API failed"}, 500  # Explicit error

        tracks = response.json().get('tracks', {}).get('items', [])
        if not tracks:
            return {"error": "No tracks found"}, 404

        track_id = tracks[0]['id']
        print("ID: " + track_id)
        song_url = f"https://api.spotify.com/v1/tracks/{track_id}"

        return {
            "song_url": song_url,
            "song_name": song_name,
            "artist": artist
        }
        
    except Exception as e:
        print(f"Backend Error: {str(e)}")  # Log the error
        return {"error": str(e)}, 500