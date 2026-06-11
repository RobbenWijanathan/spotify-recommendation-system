# Spotify Music Recommendation System

A content-based music recommendation system that suggests Spotify tracks based on audio features, metadata, and genre similarity. The system uses cosine similarity and K-Nearest Neighbors (KNN) to find songs that are musically close to a user's listening preferences.

## Overview

Modern music platforms need to recommend relevant songs from extremely large catalogs. This project builds a lightweight Spotify recommendation system using song features such as popularity, tempo, energy, danceability, loudness, acousticness, valence, genre, and other audio attributes.

The system retrieves a user's Spotify top tracks using OAuth authentication, searches for similar tracks inside a local catalog, and returns the nearest recommendations based on feature-space similarity.

## Research Questions

- How can songs be represented numerically?
- How should similarity between songs be measured?
- How can recommendations be generated efficiently at runtime?

## Features Used

The model uses the following Spotify metadata and audio features:

### Popularity
- `popularity`

### Temporal Properties
- `duration_ms`
- `tempo`
- `time_signature`

### Musical Characteristics
- `danceability`
- `energy`
- `loudness`
- `valence`

### Acoustic Properties
- `acousticness`
- `instrumentalness`
- `liveness`
- `speechiness`

### Tonal Attributes
- `key`
- `mode`

### Genre
- `track_genre`

## Methodology

### 1. Data Preprocessing

Data preprocessing includes:

- Handling missing values using imputation or removal
- Selecting relevant features
- Encoding `track_genre` into binary indicator columns
- Normalizing numerical features for fair similarity calculation

### 2. Cosine Similarity

Cosine similarity is used to compare songs based on the angle between their feature vectors, rather than raw Euclidean distance.

This helps compare songs by overall feature direction and musical profile.

### 3. K-Nearest Neighbors

KNN is used to retrieve the closest tracks from the feature matrix.

For each user song, the model finds the nearest songs using cosine similarity and returns the top recommendations.

### 4. Testing and Deployment

The system is designed to be repackaged into a web application using:

- React for the frontend
- FastAPI for the backend
- Spotify OAuth for user authentication

## Results

The system performs well for top recommendations and genre-level similarity.

Key findings:

- Mean Precision@10 is around `0.45`
- Genre similarity improves recommendation quality
- PCA shows that most variance can be captured in fewer dimensions
- KNN provides efficient and interpretable recommendations
- Niche genres such as Industrial and Comedy perform better
- Broader genres such as Classical and Black Metal perform lower

## Conclusion

This project shows that a simple content-based recommendation system can produce relevant music recommendations using Spotify audio features and genre metadata.

The system works well for songs with clear feature similarity, but could be improved with:

- Collaborative filtering
- Larger user-listening history
- Better genre embeddings
- Hybrid recommendation methods
- Real-time Spotify playlist generation

## Tech Stack

- Python
- Pandas
- NumPy
- Scikit-learn
- Matplotlib
- Spotify API
- FastAPI
- React

## Project Structure

```text
spotify-recommendation-system/
│
├── model.ipynb          # Main notebook for preprocessing, modeling, and evaluation
├── data/                # Spotify track dataset
├── src/                 # Source code for recommendation logic
├── backend/             # FastAPI backend
├── frontend/            # React frontend
├── README.md
└── requirements.txt