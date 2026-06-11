import asyncio
import httpx
from fastapi import HTTPException

SPOTIFY_API_BASE = "https://api.spotify.com/v1"


def _parse_items(items: list, seen: set[str]) -> list[dict]:
    tracks: list[dict] = []
    for item in items:
        name = item.get("name", "")
        raw_artists = item.get("artists", [])
        artist = ";".join(a["name"] for a in raw_artists if a.get("name"))
        key = f"{artist}|{name}"
        if not name or key in seen:
            continue
        seen.add(key)
        images = item.get("album", {}).get("images", [])
        image_url = images[1]["url"] if len(images) > 1 else (images[0]["url"] if images else None)
        tracks.append({"name": name, "artist": artist, "image_url": image_url})
    return tracks


async def get_user_top_tracks(
    access_token: str,
    limit: int = 100,
    time_range: str = "medium_term",
) -> list[dict]:
    headers = {"Authorization": f"Bearer {access_token}"}
    page_size = 50
    offsets = list(range(0, min(limit, 3000), page_size))

    async def fetch_page(client: httpx.AsyncClient, offset: int) -> list:
        resp = await client.get(
            f"{SPOTIFY_API_BASE}/me/top/tracks",
            headers=headers,
            params={"limit": page_size, "offset": offset, "time_range": time_range},
        )
        if resp.status_code == 401:
            raise HTTPException(
                status_code=401, detail="Invalid or expired Spotify access token"
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Spotify API error: {resp.status_code}",
            )
        return resp.json().get("items", [])

    async with httpx.AsyncClient() as client:
        pages = await asyncio.gather(*[fetch_page(client, o) for o in offsets])

    seen: set[str] = set()
    tracks: list[dict] = []
    for page in pages:
        tracks.extend(_parse_items(page, seen))

    return tracks


async def search_track_images(
    tracks: list[dict],
    access_token: str,
) -> dict[str, str | None]:
    if not tracks:
        return {}

    headers = {"Authorization": f"Bearer {access_token}"}

    async def fetch_one(
        client: httpx.AsyncClient, track: dict
    ) -> tuple[str, str | None]:
        key = f"{track['track_name']}||{track['artists']}"
        try:
            resp = await client.get(
                f"{SPOTIFY_API_BASE}/search",
                headers=headers,
                params={
                    "q": f"{track['track_name']} {track['artists']}",
                    "type": "track",
                    "limit": 1,
                },
            )
            if resp.status_code != 200:
                return key, None
            items = resp.json().get("tracks", {}).get("items", [])
            if not items:
                return key, None
            images = items[0].get("album", {}).get("images", [])
            url = images[1]["url"] if len(images) > 1 else (images[0]["url"] if images else None)
            return key, url
        except Exception:
            return key, None

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[fetch_one(client, t) for t in tracks])

    return dict(results)
