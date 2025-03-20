from flask import Flask, Blueprint, request, jsonify, render_template
import secrets
import psycopg2
from flask_cors import CORS
# from flask_talisman import Talisman
from db import get_db_connection  # Import the database connection function
from dotenv import load_dotenv
import os

from auth import generate_code_verifier, generate_code_challenge, redirect_to_auth_code_flow, get_access_token, fetch_profile

load_dotenv()  

routes = Blueprint('routes', __name__)
client_id = "ac5ea02e8f3646a2bcc0d6c0ec3ecc24"  

app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"])
# talisman = Talisman(app)

#Endpoint to generate new API keys
@routes.post('/register')
def generate_api_key():
    data = request.get_json()
    username = data.get('username')

    if not username:
        return jsonify({"error": "Username is required"}), 400

    api_key = secrets.token_hex(32)

    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the user into the database
        cursor.execute(
            "INSERT INTO users (username, api_key) VALUES (%s, %s)",
            (username, api_key)
        )
        conn.commit()

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({"message": "User registered successfully", "api_key": api_key}), 201
    except psycopg2.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#use app.route
@app.route('/login', methods=['GET', 'POST'])
def login():
    # Contains logic for logging in a user 
    try:
        # Generate PKCE code verifier and challenge
        verifier = generate_code_verifier(50)
        challenge = generate_code_challenge(verifier)

        # Build the Spotify authorization URL
        auth_url = (
            "https://accounts.spotify.com/authorize?"
            f"client_id={client_id}&"
            "response_type=code&"
            "redirect_uri=http://127.0.0.1:4000/callback"  # Adjust redirect URI
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

@routes.post('/getToken')
def getToken():
    data = request.get_json()
    code = data.get('code')
    verifier = data.get('verifier')

    try:
        token_info = get_access_token(client_id, code, verifier)
        access_token = token_info['access_token']
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@routes.get('/callback')
def callback():
    code = request.args.get('code')
    verifier = request.args.get('verifier')  # If passed in URL
    token_info = get_access_token(client_id, code, verifier)
    return jsonify({"access_token": token_info['access_token']}), 200


if __name__ == '__main__':
    app.run(port=4000, debug=True, ssl_context=('./127.0.0.1.pem', './127.0.0.1-key.pem')) # Replace ssl_context with real certificate in production
