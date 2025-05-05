import sys
import os
import pytest
import asyncio
from unittest.mock import patch, AsyncMock

# Ensure the parent directory is in sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import auth

@pytest.mark.asyncio
async def test_generate_code_challenge_and_verifier():
    verifier = auth.generate_code_verifier()
    assert isinstance(verifier, str)
    challenge = await auth.generate_code_challenge(verifier)
    assert isinstance(challenge, str)
    assert len(challenge) > 0