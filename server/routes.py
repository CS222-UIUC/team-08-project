from flask import Blueprint, request, jsonify, render_template
from server.auth import require_api_key
import secrets

routes = Blueprint('routes', __name__)

#Endpoint to generate new API keys
@routes.post('/register')
def generate_api_key():
    api_key = secrets.token_hex(32)

    try:
        pass # UPDATE: Store API key in Postgres DB

        return jsonify({"message": "API key generated successfully", "api_key": api_key}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@routes.post('/login')
def register():
    # Contains logic for logging in a user
    pass
    

@routes.post('/findSong')
@require_api_key 
def getSong():
    # Contains logic for getting song data from Spotify API
    pass
   

@routes.get('/updateProfile')
@require_api_key
def get_balance():
    # Contains logic for sending user data to DB
    pass
