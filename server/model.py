import requests
import google.generativeai as genai
from auth import ngrok_url
from routes import playlist_id

# === CONFIG ===
GEMINI_API_KEY = 'AIzaSyBpzUJpepdVDNcgesSLIbCGMFra3a_S5vA'
FLASK_SERVER_URL = ngrok_url  # or your actual Flask server URL

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
    model = genai.GenerativeModel("gemini-pro")

    song_list_text = "\n".join(
        [f"- '{song['track_name']}' by {song['artist_name']} (ID: {song['track_id']})" for song in songs]
    )

    prompt = (
        f"Given the following list of songs, recommend **one** similar song that fits the overall vibe "
        f"and provide only the Spotify web URL (https://open.spotify.com/track/...):\n\n"
        f"{song_list_text}\n\n"
        f"Only return the URL of the recommended song."
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

def main():
    token = get_access_token()
    print("Token: "+token)
    # playlist_id = input("Enter Spotify Playlist ID: ").strip()
    playlist_id = get_playlist_id()
    print("ID: "+playlist_id)
    playlist_data = get_playlist_tracks(playlist_id, token)

    print(f"\nFound {len(playlist_data['items'])} tracks in the playlist.\n")

    for item in playlist_data['items']:
        track = item['track']
        if not track:
            continue

        track_name = track['name']
        # track_id = track['id']
        artist_name = ", ".join(artist['name'] for artist in track['artists'])

        print(f"🎵 {track_name} by {artist_name}")

        # features = get_audio_features(track_id, token)
        # for key in ['mode', 'tempo', 'energy', 'valence', 'danceability']:
        #     print(f"  {key.capitalize()}: {features.get(key)}")

    gemini_response = get_gemini_url(playlist_data['items'])
    print(f"🔗 Gemini's Suggested API URL:\n  {gemini_response}\n")

if __name__ == "__main__":
    main()
