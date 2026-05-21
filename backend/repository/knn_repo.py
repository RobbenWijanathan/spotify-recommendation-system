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


def get_recommendations(
    track_names: list[str], n: int = 10
) -> tuple[list[dict] | None, list[str], int]:
    knn_index, X_norm, metadata, name_to_index, name_to_index_lower = _load_artifacts()

    found_indices: list[int] = []
    not_found: list[str] = []

    for name in track_names:
        if name in name_to_index:
            found_indices.append(name_to_index[name])
        elif name.lower() in name_to_index_lower:
            found_indices.append(name_to_index_lower[name.lower()])
        else:
            not_found.append(name)

    if not found_indices:
        return None, not_found, 0

    query_vector = X_norm[found_indices].mean(axis=0, keepdims=True)

    n_query = min(n + len(found_indices) + 10, X_norm.shape[0] - 1)
    distances, indices = knn_index.kneighbors(query_vector, n_neighbors=n_query)

    found_set = set(found_indices)
    results: list[dict] = []

    for dist, idx in zip(distances[0], indices[0]):
        if idx in found_set:
            continue
        if len(results) >= n:
            break

        row = metadata.iloc[idx]
        results.append(
            {
                "track_name": str(row["track_name"]),
                "artists": str(row["artists"]),
                "genre": str(row["track_genre"]),
                "similarity_score": round(float(1.0 - dist), 4),
            }
        )

    return results, not_found, len(found_indices)
