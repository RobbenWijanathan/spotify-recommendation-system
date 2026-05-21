import base64
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse, RedirectResponse

from backend.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SCOPES = "user-top-read"


@router.get("/login")
async def login():
    settings = get_settings()
    params = {
        "client_id": settings.spotify_client_id,
        "response_type": "code",
        "redirect_uri": settings.spotify_redirect_uri,
        "scope": SCOPES,
        "state": secrets.token_urlsafe(16),
    }
    return RedirectResponse(url=f"{SPOTIFY_AUTH_URL}?{urlencode(params)}")


@router.get("/callback")
async def callback(
    code: str = Query(...),
    state: str = Query(None),
    error: str = Query(None),
):
    if error:
        return JSONResponse(
            status_code=400,
            content={"status": 400, "message": f"Spotify OAuth error: {error}"},
        )

    settings = get_settings()
    encoded_creds = base64.b64encode(
        f"{settings.spotify_client_id}:{settings.spotify_client_secret}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_TOKEN_URL,
            headers={
                "Authorization": f"Basic {encoded_creds}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.spotify_redirect_uri,
            },
        )

    if response.status_code != 200:
        return JSONResponse(
            status_code=502,
            content={
                "status": 502,
                "message": "Failed to exchange authorization code for token",
            },
        )

    token = response.json()
    frontend_url = settings.frontend_url
    return RedirectResponse(
        url=f"{frontend_url}/?token={token['access_token']}",
        status_code=302,
    )
