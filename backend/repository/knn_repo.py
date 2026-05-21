import warnings
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np

ARTIFACTS_DIR = Path(__file__).parent.parent.parent / "artifacts"


@lru_cache(maxsize=1)
def _load_artifacts():
    def load(name):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            return joblib.load(ARTIFACTS_DIR / name)

    knn_index = load("knn_index.pkl")
    X_norm = load("X_norm.pkl")
    metadata = load("metadata.pkl")
    name_to_index: dict = load("name_to_index.pkl")

    name_to_index_lower = {
        k.lower(): v for k, v in name_to_index.items() if isinstance(k, str)
    }

    return knn_index, X_norm, metadata, name_to_index, name_to_index_lower


def _lookup(
    name: str,
    artist: str,
    name_to_index: dict,
    name_to_index_lower: dict,
) -> int | None:
    key = f"{artist} - {name}"
    if key in name_to_index:
        return name_to_index[key]
    lower = key.lower()
    if lower in name_to_index_lower:
        return name_to_index_lower[lower]
    return None


def get_per_track_recommendations(
    tracks: list[dict],
    n_per_track: int = 5,
    max_ref_tracks: int = 5,
) -> tuple[list[dict] | None, list[str], int]:
    knn_index, X_norm, metadata, name_to_index, name_to_index_lower = _load_artifacts()

    found: list[int] = []
    not_found: list[str] = []
    seen_indices: set[int] = set()

    for track in tracks:
        if len(found) >= max_ref_tracks:
            break
        idx = _lookup(track["name"], track["artist"], name_to_index, name_to_index_lower)
        if idx is not None and idx not in seen_indices:
            found.append(idx)
            seen_indices.add(idx)
        else:
            not_found.append(track["name"])

    if not found:
        return None, not_found, 0

    track_groups: list[dict] = []
    n_query = min(n_per_track + 1, X_norm.shape[0] - 1)

    for query_idx in found:
        query_vector = X_norm[query_idx : query_idx + 1]
        distances, indices = knn_index.kneighbors(query_vector, n_neighbors=n_query)

        source_row = metadata.iloc[query_idx]
        recs: list[dict] = []

        for dist, idx in zip(distances[0], indices[0]):
            if idx == query_idx:
                continue
            if len(recs) >= n_per_track:
                break
            row = metadata.iloc[idx]
            recs.append(
                {
                    "track_name": str(row["track_name"]),
                    "artists": str(row["artists"]),
                    "genre": str(row["track_genre"]),
                    "similarity_score": round(float(1.0 - dist), 4),
                }
            )

        track_groups.append(
            {
                "source": {
                    "track_name": str(source_row["track_name"]),
                    "artists": str(source_row["artists"]),
                    "genre": str(source_row["track_genre"]),
                },
                "recommendations": recs,
            }
        )

    return track_groups, not_found, len(found)
