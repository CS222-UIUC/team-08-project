import asyncio
import aiohttp
import secrets
import hashlib
import base64
import urllib.parse
import requests

client_id = "ac5ea02e8f3646a2bcc0d6c0ec3ecc24"  
code = None
verifier = None 

def generate_code_verifier(length):
    """Generate a random code verifier."""
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return ''.join(secrets.choice(possible) for _ in range(length))

async def generate_code_challenge(code_verifier):
    """Generate a code challenge from the code verifier."""
    # Encode the verifier to bytes
    verifier_bytes = code_verifier.encode('utf-8')
    
    # Compute SHA-256 digest
    digest = hashlib.sha256(verifier_bytes).digest()
    
    # Base64 URL-safe encode the digest
    encoded_digest = base64.urlsafe_b64encode(digest).decode('utf-8')
    
    # Remove padding and replace characters as per spec
    challenge = encoded_digest.rstrip('=').replace('+', '-').replace('/', '_')
    
    return challenge

#redirects user to uri with authorization code. Need to find a way to store user auth code bc app is redirect uri is useless
async def redirect_to_auth_code_flow(client_id):
    """Redirect to Spotify authorization page."""
    global verifier
    verifier = generate_code_verifier(128)
    challenge = await generate_code_challenge(verifier)
    
    # Store the verifier (in a real app, use a secure method like a session or secure storage)
    print(f"Storing verifier: {verifier}")
    client_id = "ac5ea02e8f3646a2bcc0d6c0ec3ecc24"  

    params = {
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": "http://addip/callback",
        "scope": "user-read-private user-read-email",
        "code_challenge_method": "S256",
        "code_challenge": challenge,
    }
    
    # Construct the authorization URL
    auth_url = f"https://accounts.spotify.com/authorize?{urllib.parse.urlencode(params)}"
    
    print(f"Redirecting to: {auth_url}")

async def get_access_token(client_id, code, verifier):
    """Get access token for the authorization code."""
    
    # Prepare parameters for the token request
    params = {
        "client_id": client_id,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": "http://addip/callback",
        "code_verifier": verifier,
    }
    
    # Make POST request to obtain access token
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data=params,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code != 200:
        error_data = response.json()
        raise Exception(f"Token request failed: {error_data.get('error_description', 'Unknown error')}")
    
    response_data = response.json()

    return response_data

    

async def fetch_profile(token):
    """Fetch user profile using the access token."""
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://api.spotify.com/v1/me",
            headers={"Authorization": f"Bearer {token}"},
        ) as response:
            return await response.json()


#Flow
#RedirectToAuth -> GetToken -> fetchProfile
