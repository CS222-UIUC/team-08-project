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

def get_access_token():
    response = requests.get(FLASK_SERVER_URL+"/getToken")
    response.raise_for_status()
    return response.text.strip() 

def get_playlist_id():
    response = requests.get(FLASK_SERVER_URL+"/getPlaylistId")
    response.raise_for_status()
    return response.text.strip() 

def get_gemini_url(songs):
    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-001")

    song_list_text = "\n".join(
        [f"- '{song['track']['name']}' by {', '.join(artist['name'] for artist in song['track']['artists'])} (ID: {song['track']['id']})"for song in songs if song.get('track')]
    )
    print("CALLED Gemini URL")
    prompt = (
        f"Given the following list of songs and artists, recommend **one** similar song that fits the overall vibe "
        f"and provide only the song name and artist in this format(Song, Artist):\n\n"
        f"{song_list_text}\n\n"
    )

    response = model.generate_content(prompt)
    return response.text.strip()


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
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def get_audio_features(track_id, token):
    url = f"https://api.spotify.com/v1/audio-features/{track_id}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

async def main_model(playlist_id):
    token = get_access_token()
    print("Token: "+token)
    print("ID: "+playlist_id)
    playlist_data = get_playlist_tracks(playlist_id, token)

    print(f"\nFound {len(playlist_data['items'])} tracks in the playlist.\n")

    gemini_response = get_gemini_url(playlist_data['items'])
    song_name, artist = gemini_response.split(", ")
    base_url = "https://api.spotify.com/v1/search"

    # URL parameters
    params = {
        "q": f'track:"{song_name}" artist:"{artist}"',
        "type": "track"
    }

    # Encode the parameters into a query string
    query_string = urlencode(params)

    # Construct the full URL
    rec_url = f"{base_url}?{query_string}"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # write_user_genre(username, get_gemini_genre(playlist_data['items']))

    # Make the API request
    response = requests.get(rec_url, headers=headers)

    if response.status_code == 200:
        response_data= response.json()
        song_id = response_data['tracks']['items'][0]['id']
        song_url = "https://api.spotify.com/v1/tracks/"+song_id
        print(f"Gemini's Suggested Song:  {gemini_response}\n {song_url}")
        return song_url, song_id
    else:
        print(f"Error: {response.status_code}, {response.text}")
