import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()  

def get_db_connection():
    return psycopg2.connect(
        dbname=os.environ.get("DB_NAME"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        host=os.environ.get("DB_HOST", "localhost"),
        port=os.environ.get("DB_PORT", "5432")
    )

def add_or_get_user(username: str) -> str:
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
                        "INSERT INTO users (id, username, genre) VALUES (%s, %s, %s)",
                        (new_id, username, default_genre)
                    )
                    return default_genre
    finally:
        conn.close()