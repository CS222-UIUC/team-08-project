from flask import Flask, Blueprint, request, jsonify, render_template, session, redirect
import secrets
import psycopg2
from flask_cors import CORS
# from flask_talisman import Talisman
# from db import get_db_connection, add_or_get_user  # Import the database connection function
from dotenv import load_dotenv
import os
import asyncio
import json
from auth import generate_code_verifier, generate_code_challenge, get_access_token, get_user_info, ngrok_url
import requests
from model import main_model
load_dotenv()  

routes = Blueprint('routes', __name__)
client_id = "ac5ea02e8f3646a2bcc0d6c0ec3ecc24"  
verifier = generate_code_verifier(64) 
challenge = ""
access_token = ""
playlist_id = ""
app = Flask(__name__)
CORS(app, origins=["exp://10.194.148.244:8081", "http://localhost:8081"])




#use app.route
@app.route('/login', methods=['GET', 'POST'])
def login():
    # Contains logic for logging in a user 
    try:
        # Generate PKCE code verifier and challenge
        challenge = asyncio.run(generate_code_challenge(verifier))
        # Build the Spotify authorization URL
        auth_url = (
            "https://accounts.spotify.com/authorize?"
            f"client_id={client_id}&"
            "response_type=code&"
            f"redirect_uri={ngrok_url}/callback&" 
            "scope=user-read-private user-read-email user-library-read user-library-modify playlist-read-private playlist-read-collaborative playlist-modify-public&"      # Add scopes as needed
            f"code_challenge={challenge}&"
            "code_challenge_method=S256"
        )

        # Return the auth URL and verifier to React Native
        return jsonify({
            "message": "Redirect to this URL for Spotify login",
            "auth_url": auth_url,
            "verifier": verifier  # Store this in React Native for token exchange
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/callback')
def callback():
    global access_token
    global playlist_id
    code = request.args.get('code')
    token_info = asyncio.run(get_access_token(client_id, code, verifier))
    access_token = token_info.get('access_token')

    url = "https://api.spotify.com/v1/me/playlists?limit=3"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching playlists: {response.status_code}")
        print(response.json())
        return None

    data = response.json()
    items = data.get("items", [])
    print("PLAYLIST LIST "+str(len(items)))
    if not items:
        print("No playlists found.")
        return None

    playlist = items[2]
    print(f"Found playlist: {playlist['name']} (ID: {playlist['id']})")
    playlist_id = playlist['id']

    #comment out below section if aws rds is not running
    print(playlist_id)
    # Retrieve the user's display name (username) from Spotify using the access token
    data = asyncio.run(get_user_info(access_token))
    display_name = data.get("display_name")
    username = data.get("id")
    print("Display Name: " + display_name)
    print("Username: " + username)
    
    # Write user info to the database (or get the existing user's genre)
    # genre = add_or_get_user(username, display_name)
    # main_model(playlist_id)

    return access_token
    # access token is granted after user gives us permissions. We can use a users access token to retrieve information aout their spotify profile through api

@app.route('/getToken')
def getToken():
    return access_token

@app.route('/getPlaylistId')
def getPlaylistID():
    return playlist_id

@app.route('/getPlaylists')
def getPlaylists():
    url = "https://api.spotify.com/v1/me/playlists?limit=20"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching playlists: {response.status_code}")
        print(response.json())
        return None

    data = response.json()
    playlists = data.get("items", [])
    print("PLAYLIST LIST "+str(len(playlists)))
    if not playlists:
        print("No playlists found.")
        return None
    
    return playlists

@app.route('/getNextSong')
def getNextSong():
    playlist_id = request.args.get('playlist_id')
    model_response = asyncio.run(main_model(playlist_id))
    song_url, song_id = model_response

    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    response = requests.get(song_url, headers=headers)
    if response.status_code != 200:
        print(f"Error getting song: {response.status_code}")
        print(response.json())
        return None
    
    data = response.json()
    song_name = data["name"]

    artist_name = data["artists"][0]["name"]

    image_url = data["album"]["images"][0]["url"]

    return jsonify({
        "message": "Successfully returned next song",
        "title": song_name,
        "artist": artist_name,
        "imageURL": image_url,
        "song_id": song_id
    }), 200


@app.route('/addToPlaylist')
def addToPlaylist():
    playlist_id = request.args.get("playlist_id")
    song_id = request.args.get("song_id")
    print(f"RUNNING ---------------------------: ", song_id)

    # song_id = "2WfaOiMkCvy7F5fcp2zZ8L"
    url = "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    data = {
        "uris": [f"spotify:track:{song_id}"],
        "position": 0
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code != 201:
        print(f"Error adding to playlist: {response.status_code}")
        print(response.json())
        return None
    
    print(f"Successfully added to playlist")
    return jsonify({
        "message": "Successfully added to playlist"
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True) # Replace ssl_context with real certificate in production