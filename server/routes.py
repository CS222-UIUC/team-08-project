from flask import Flask, Blueprint, request, jsonify, render_template, session, redirect
import secrets
import psycopg2
from flask_cors import CORS
# from flask_talisman import Talisman
from db import get_db_connection, add_or_get_user  # Import the database connection function
from dotenv import load_dotenv
import os
import asyncio
import json
from auth import generate_code_verifier, generate_code_challenge, get_access_token, get_user_info, ngrok_url
import requests
load_dotenv()  

routes = Blueprint('routes', __name__)
client_id = "ac5ea02e8f3646a2bcc0d6c0ec3ecc24"  
verifier = generate_code_verifier(64) 
challenge = ""
access_token = ""
playlist_id = "Hello"
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
            "scope=user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative&"      # Add scopes as needed
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

    url = "https://api.spotify.com/v1/me/playlists?limit=1"
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
    if not items:
        print("No playlists found.")
        return None

    playlist = items[0]
    print(f"Found playlist: {playlist['name']} (ID: {playlist['id']})")
    playlist_id = playlist['id']

    #comment out below section if aws rds is not running
    print(playlist_id)
    # Retrieve the user's display name (username) from Spotify using the access token
    data = asyncio.run(get_user_info(access_token))
    display_name = data.get("display_name")
    id = data.get("id")
    print("Display Name: " + display_name)
    print("ID: " + id)
    
    # Write user info to the database (or get the existing user's genre)
    genre = add_or_get_user(id, display_name)

    return access_token
    # access token is granted after user gives us permissions. We can use a users access token to retrieve information aout their spotify profile through api

@app.route('/getToken')
def getToken():
    return access_token

@app.route('/getPlaylistId')
def getPlaylistID():
    return playlist_id

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True) # Replace ssl_context with real certificate in production