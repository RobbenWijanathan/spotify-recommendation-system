from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.repository import knn_repo, music_repo

router = APIRouter(prefix="/music", tags=["music"])
security = HTTPBearer()


@router.get("/recommendations")
async def get_recommendations(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    access_token = credentials.credentials

    tracks = await music_repo.get_user_top_tracks(access_token, limit=3000)

    if not tracks:
        return JSONResponse(
            status_code=404,
            content={"status": 404, "message": "No top tracks found for this user"},
        )

    track_groups, not_found, matched_count = knn_repo.get_per_track_recommendations(
        tracks, n_per_track=5, max_ref_tracks=5
    )

    if track_groups is None:
        return JSONResponse(
            status_code=404,
            content={
                "status": 404,
                "message": "Songs not in model's data comprehention",
            },
        )

    name_to_image = {t["name"]: t.get("image_url") for t in tracks}
    for group in track_groups:
        group["source"]["image_url"] = name_to_image.get(group["source"]["track_name"])

    all_recs = [r for g in track_groups for r in g["recommendations"]]
    if all_recs:
        image_map = await music_repo.search_track_images(all_recs, access_token)
        for group in track_groups:
            for rec in group["recommendations"]:
                key = f"{rec['track_name']}||{rec['artists']}"
                rec["image_url"] = image_map.get(key)

    return JSONResponse(
        status_code=200,
        content={
            "status": 200,
            "message": f"Recommendations based on {matched_count} of your top tracks",
            "data": {
                "track_groups": track_groups,
                "tracks_matched": matched_count,
                "tracks_not_found": not_found,
                "total_reference_tracks": len(tracks),
            },
        },
    )
