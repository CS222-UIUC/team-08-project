import aiohttp
import hashlib
import base64
import os
import json

client_id = "ac5ea02e8f3646a2bcc0d6c0ec3ecc24"  

def generate_code_verifier(length: int = 32) -> tuple[str, str]:
    """Generate a random code verifier."""
    verifier = base64.urlsafe_b64encode(os.urandom(length)).rstrip(b'=').decode('utf-8')
    return verifier


async def generate_code_challenge(code_verifier: str) -> str:
    hashed = hashlib.sha256(code_verifier.encode('utf-8')).digest()
    code_challenge = base64.urlsafe_b64encode(hashed).rstrip(b'=').decode('utf-8')
    return code_challenge


async def get_access_token(client_id, code, verifier):
    """Get access token for the authorization code."""
    async with aiohttp.ClientSession() as session:
        params = {
            "client_id": client_id,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": "https://69f7-130-126-255-122.ngrok-free.app/callback",
            "code_verifier": verifier,
        }
        
        async with session.post(
            "https://accounts.spotify.com/api/token",
            data=params,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        ) as response:
            if response.status != 200:
                error_data = await response.json()
                raise Exception(f"Token request failed: {error_data.get('error_description', 'Unknown error')}")
            return await response.json()
        

async def get_user_info(token: str) -> str:
    async with aiohttp.ClientSession() as session:
        headers = {"Authorization": f"Bearer {token}"}
        async with session.get("https://api.spotify.com/v1/me", headers=headers) as response:
            text = await response.text()
            print("Raw response text:", text)  # Log the raw response
            if not text:
                raise Exception("Empty response received from Spotify API.")
            try:
                data = json.loads(text)
            except json.JSONDecodeError as e:
                raise Exception(f"Error decoding JSON: {e}; response text: {text}")
            
            if response.status != 200:
                raise Exception(f"User info request failed (status {response.status}): {data.get('error', 'Unknown error')}")
            
            display_name = data.get("display_name")
            if not display_name:
                raise Exception("Display name not found in the response.")
            
            return display_name



# async def redirect_to_auth_code_flow(client_id):
#     """Redirect to Spotify authorization page."""
#     verifier = generate_code_verifier(50)
#     challenge = await generate_code_challenge(verifier)
    
#     # Store the verifier securely (e.g., in a session or secure storage)
#     print(f"Storing verifier: {verifier}")
    
    # params = {
    #     "client_id": client_id,
    #     "response_type": "code",
    #     "redirect_uri": "https://36be-130-126-255-168.ngrok-free.app/callback",
    #     "scope": "user-read-private user-read-email",
    #     "code_challenge_method": "S256",
    #     "code_challenge": challenge,
    # }
    
    # auth_url = f"https://accounts.spotify.com/authorize?{urllib.parse.urlencode(params)}"
    # print(f"Redirecting to: {auth_url}")
    
    # return verifier

#Flow
#RedirectToAuth -> GetToken -> fetchProfile