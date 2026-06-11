import { useCallback, useState } from 'react'
import MusicCard from './MusicCard'

interface Recommendation {
  track_name: string
  artists: string
  genre: string
  similarity_score: number
  image_url?: string | null
}

interface TrackGroup {
  source: {
    track_name: string
    artists: string
    genre: string
    image_url?: string | null
  }
  recommendations: Recommendation[]
}

interface ApiResponse {
  status: number
  message: string
  data?: {
    track_groups: TrackGroup[]
    tracks_matched: number
    total_reference_tracks: number
  }
}

interface Props {
  token: string
  onTokenClear: () => void
}

export default function DemoSection({ token, onTokenClear }: Props) {
  const [groups, setGroups] = useState<TrackGroup[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ matched: number; total: number } | null>(null)

  const fetchRecs = useCallback(async () => {
    setLoading(true)
    setError(null)
    setGroups(null)
    setMeta(null)
    try {
      const res = await fetch('/music/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ApiResponse = await res.json()
      if (res.status === 401) {
        onTokenClear()
        setError('Session expired. Please reconnect.')
        return
      }
      if (!res.ok || !data.data) {
        setError(data.message)
        return
      }
      setGroups(data.data.track_groups)
      setMeta({ matched: data.data.tracks_matched, total: data.data.total_reference_tracks })
    } catch {
      setError('Failed to reach the server.')
    } finally {
      setLoading(false)
    }
  }, [token, onTokenClear])

  return (
    <div style={{ width: '100%', maxWidth: 720 }} className="reveal">
      <div className="trial-controls">
        <button className="btn-primary" onClick={fetchRecs} disabled={loading}>
          {loading ? 'Loading…' : 'Generate Recommendations'}
        </button>
        {meta && (
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-2)' }}>
            {meta.matched} reference tracks · {meta.matched * 5} recommendations
          </span>
        )}
      </div>

      {error && <p className="error-msg">{error}</p>}

      {groups && (
        <>
          <div className="ref-strip">
            <p className="ref-strip-label">Used from your library</p>
            <div className="ref-cards">
              {groups.map((g, i) => (
                <MusicCard
                  key={i}
                  trackName={g.source.track_name}
                  artists={g.source.artists}
                  genre={g.source.genre}
                  imageUrl={g.source.image_url}
                  animDelay={i * 60}
                />
              ))}
            </div>
          </div>

          <div className="rec-groups">
            {groups.map((g, gi) => (
              <div key={gi} className="rec-group">
                <div className="rec-group-header">
                  <span className="rec-group-label">Based on</span>
                  <span className="rec-group-name">{g.source.track_name}</span>
                  <span className="rec-group-artist">— {g.source.artists}</span>
                </div>
                <div className="rec-grid">
                  {g.recommendations.map((r, ri) => (
                    <MusicCard
                      key={ri}
                      trackName={r.track_name}
                      artists={r.artists}
                      genre={r.genre}
                      imageUrl={r.image_url}
                      similarityScore={r.similarity_score}
                      animDelay={gi * 200 + ri * 55}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
