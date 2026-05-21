import httpx
from fastapi import HTTPException

SPOTIFY_API_BASE = "https://api.spotify.com/v1"


async def get_user_top_tracks(
    access_token: str,
    limit: int = 50,
    time_range: str = "medium_term",
) -> list[str]:
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"limit": limit, "time_range": time_range}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE}/me/top/tracks",
            headers=headers,
            params=params,
        )

    if response.status_code == 401:
        raise HTTPException(
            status_code=401, detail="Invalid or expired Spotify access token"
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Spotify API error: {response.status_code}",
        )

    items = response.json().get("items", [])
    seen: set[str] = set()
    track_names: list[str] = []
    for item in items:
        name = item.get("name", "")
        if name and name not in seen:
            seen.add(name)
            track_names.append(name)

    return track_names
