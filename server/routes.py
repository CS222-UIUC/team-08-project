from flask import Flask, Blueprint, request, jsonify, render_template, session, redirect
import secrets
import psycopg2
from flask_cors import CORS
# from flask_talisman import Talisman
from db import get_db_connection  # Import the database connection function
from dotenv import load_dotenv
import os
import asyncio
import json
from auth import generate_code_verifier, generate_code_challenge, get_access_token

load_dotenv()  

routes = Blueprint('routes', __name__)
client_id = "ac5ea02e8f3646a2bcc0d6c0ec3ecc24"  
verifier = generate_code_verifier(64) 
challenge = ""
access_token = ""
app = Flask(__name__)
CORS(app, origins=["exp://10.194.148.244:8081", "http://localhost:8081"])
# talisman = Talisman(app)


#use app.route
@app.route('/login', methods=['GET', 'POST'])
def login():
    # Contains logic for logging in a user 
    try:
        # Generate PKCE code verifier and challenge
        # verifier = generate_code_verifier(64)
        # session['pkce_verifier'] = verifier
        challenge = asyncio.run(generate_code_challenge(verifier))
        # Build the Spotify authorization URL
        auth_url = (
            "https://accounts.spotify.com/authorize?"
            f"client_id={client_id}&"
            "response_type=code&"
            "redirect_uri=https://36be-130-126-255-168.ngrok-free.app/callback&"  # Adjust redirect URI
            "scope=user-read-private user-read-email&"      # Add scopes as needed
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
    code = request.args.get('code')
    token_info = asyncio.run(get_access_token(client_id, code, verifier))
    access_token = token_info.get('access_token')

    return access_token
    # access token is granted after user gives us permissions. We can use a users access token to retrieve information aout their spotify profile through api

@app.route('/retur')
def retur():
    return "Hello"

@app.route('/getToken')
def getToken():
    return access_token



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True) # Replace ssl_context with real certificate in production