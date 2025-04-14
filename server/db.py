import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
load_dotenv(dotenv_path, override=True)  

def get_db_connection():
    dbname = os.environ.get("DB_NAME")
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "5432")
    
    print(f"Connecting to DB with dbname={dbname}, user={user}, host={host}, port={port}")
    # Ensure password is not None here:
    if password is None:
        raise Exception("DB_PASSWORD environment variable is not set!")
    
    return psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )


def add_or_get_user(username: str, display_name: str) -> str:
    conn = get_db_connection()
    
    try:
        with conn:
            with conn.cursor() as cur:
                # Check if the username already exists
                cur.execute("SELECT genre FROM users WHERE username = %s", (username,))
                result = cur.fetchone()
                if result is not None:
                    # User exists; retrieve the genre.
                    user_genre = result[0]
                    return user_genre
                else:
                    # Determine new unique id based on the current count of users.
                    cur.execute("SELECT COUNT(*) FROM users")
                    count = cur.fetchone()[0]
                    new_id = count  # This will be the current number of users; adjust to count+1 if needed.
                    
                    # Insert new user with default genre 'Pop'
                    default_genre = "Pop"
                    cur.execute(
                        "INSERT INTO users (id, username, display_name, genre) VALUES (%s, %s, %s, %s)",
                        (new_id, username, display_name, default_genre)
                    )
                    return default_genre
    finally:
        conn.close()


def write_user_genre(username: str, new_genre: str) -> bool:
    conn = get_db_connection()
    
    try:
        with conn:
            with conn.cursor() as cur:
                # Check if the user exists
                cur.execute("SELECT 1 FROM users WHERE username = %s", (username,))
                if cur.fetchone() is None:
                    return False  # User does not exist

                # Update the user's genre
                cur.execute(
                    "UPDATE users SET genre = %s WHERE username = %s",
                    (new_genre, username)
                )
                return True
    finally:
        conn.close()