from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.repository import knn_repo, music_repo

router = APIRouter(prefix="/music", tags=["music"])
security = HTTPBearer()


@router.get("/recommendations")
async def get_recommendations(
    n: int = Query(default=10, ge=1, le=100),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    access_token = credentials.credentials

    track_names = await music_repo.get_user_top_tracks(access_token, limit=50)

    if not track_names:
        return JSONResponse(
            status_code=404,
            content={"status": 404, "message": "No top tracks found for this user"},
        )

    recommendations, not_found, matched_count = knn_repo.get_recommendations(
        track_names, n=n
    )

    if recommendations is None:
        return JSONResponse(
            status_code=404,
            content={
                "status": 404,
                "message": "Songs not in model's data comprehention",
            },
        )

    return JSONResponse(
        status_code=200,
        content={
            "status": 200,
            "message": f"Recommendations generated based on {matched_count} of your top tracks",
            "data": {
                "recommendations": recommendations,
                "tracks_matched": matched_count,
                "tracks_not_found": not_found,
                "total_reference_tracks": len(track_names),
            },
        },
    )
