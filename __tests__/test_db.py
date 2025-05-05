import sys
import os
import pytest
from unittest.mock import patch, MagicMock

# Add parent directory to path to import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import db

def test_get_db_connection():
    # Mock environment variables
    with patch.dict('os.environ', {
        'DB_NAME': 'test_db',
        'DB_USER': 'test_user',
        'DB_PASSWORD': 'test_password',
        'DB_HOST': 'localhost',
        'DB_PORT': '5432'
    }):
        # Mock the psycopg2.connect function
        with patch('psycopg2.connect') as mock_connect:
            # Setup mock to return a connection object
            mock_connect.return_value = MagicMock()
            
            # Call the function
            connection = db.get_db_connection()
            
            # Assert connection was called with correct arguments
            mock_connect.assert_called_once()
            assert connection is not None

def test_add_or_get_existing_user():
    # Mock the database connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    
    # Setup mock to return an existing user with genre "Rock"
    mock_cursor.fetchone.return_value = ['Rock']
    
    # Mock the get_db_connection function
    with patch('server.db.get_db_connection', return_value=mock_conn):
        # Call the function
        genre = db.add_or_get_user('existing_user', 'Existing User')
        
        # Verify the correct genre was returned
        assert genre == 'Rock'

def test_add_or_get_new_user():
    # Mock the database connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    
    # Setup mock for a new user (first None for user check, then 5 for count)
    mock_cursor.fetchone.side_effect = [None, (5,)]
    
    # Mock the get_db_connection function
    with patch('server.db.get_db_connection', return_value=mock_conn):
        # Call the function
        genre = db.add_or_get_user('new_user', 'New User')
        
        # Verify default genre was returned
        assert genre == 'Pop'

def test_write_user_genre_success():
    # Mock the database connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    
    # Setup mock to indicate user exists
    mock_cursor.fetchone.return_value = [1]
    
    # Mock the get_db_connection function
    with patch('server.db.get_db_connection', return_value=mock_conn):
        # Call the function
        result = db.write_user_genre('existing_user', 'Jazz')
        
        # Verify success was returned
        assert result is True

def test_write_user_genre_user_not_found():
    # Mock the database connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    
    # Setup mock to indicate user doesn't exist
    mock_cursor.fetchone.return_value = None
    
    # Mock the get_db_connection function
    with patch('server.db.get_db_connection', return_value=mock_conn):
        # Call the function
        result = db.write_user_genre('nonexistent_user', 'Jazz')
        
        # Verify failure was returned
        assert result is False
