import { useCallback, useEffect, useState } from 'react'

interface Recommendation {
  track_name: string
  artists: string
  genre: string
  similarity_score: number
}

interface ApiResponse {
  status: number
  message: string
  data?: {
    recommendations: Recommendation[]
    tracks_matched: number
    total_reference_tracks: number
  }
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

export default function DemoSection() {
  const [token, setToken] = useState<string | null>(null)
  const [n, setN] = useState(10)
  const [recs, setRecs] = useState<Recommendation[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ matched: number; total: number } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) {
      setToken(t)
      localStorage.setItem('spotify_token', t)
      window.history.replaceState({}, '', window.location.pathname)
    } else {
      const stored = localStorage.getItem('spotify_token')
      if (stored) setToken(stored)
    }
  }, [])

  const fetchRecs = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    setRecs(null)
    setMeta(null)
    try {
      const res = await fetch(`/music/recommendations?n=${n}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ApiResponse = await res.json()
      if (res.status === 401) {
        setToken(null)
        localStorage.removeItem('spotify_token')
        setError('Session expired. Please reconnect.')
        return
      }
      if (!res.ok || !data.data) {
        setError(data.message)
        return
      }
      setRecs(data.data.recommendations)
      setMeta({ matched: data.data.tracks_matched, total: data.data.total_reference_tracks })
    } catch {
      setError('Failed to reach the server.')
    } finally {
      setLoading(false)
    }
  }, [token, n])

  if (!token) {
    return (
      <div className="demo-connect reveal">
        <p className="section-sub" style={{ marginBottom: 32 }}>
          Connect your Spotify account to get personalized<br />recommendations powered by the model.
        </p>
        <a className="btn-spotify" href="/auth/login">
          <SpotifyIcon />
          Connect with Spotify
        </a>
      </div>
    )
  }

  return (
    <div className="demo-user reveal">
      <div className="n-selector">
        <label>Recommendations</label>
        <input
          type="range"
          min={5}
          max={50}
          value={n}
          onChange={e => setN(Number(e.target.value))}
        />
        <span className="n-val">{n}</span>
        <button className="btn-primary" onClick={fetchRecs} disabled={loading}>
          {loading ? 'Loading…' : 'Generate'}
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {meta && (
        <p className="meta-info">
          Based on {meta.matched} of your top {meta.total} tracks
        </p>
      )}
      {recs && (
        <div className="rec-grid">
          {recs.map((r, i) => (
            <div key={i} className="rec-card" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="rec-genre">{r.genre}</div>
              <div className="rec-name">{r.track_name}</div>
              <div className="rec-artist">{r.artists}</div>
              <div className="rec-bar-track">
                <div className="rec-bar-fill" style={{ width: `${r.similarity_score * 100}%` }} />
              </div>
              <div className="rec-sim">Similarity {(r.similarity_score * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
