import { useEffect, useState } from 'react'
import NavDots from './components/NavDots'
import DemoSection from './components/DemoSection'
import './App.css'

const SECTIONS = ['hero', 'trial']

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

export default function App() {
  const [active, setActive] = useState(0)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) {
      setToken(t)
      localStorage.setItem('spotify_token', t)
      window.history.replaceState({}, '', window.location.pathname)
    } else {
      setToken(localStorage.getItem('spotify_token'))
    }
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          obs.unobserve(entry.target)
        }
      }, { threshold: 0.1 })
      obs.observe(el)
      observers.push(obs)
    })

    SECTIONS.forEach((id, i) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setActive(i)
      }, { threshold: 0.5 })
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [token])

  const clearToken = () => {
    setToken(null)
    localStorage.removeItem('spotify_token')
  }

  const scrollToTrial = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('trial')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <NavDots sections={SECTIONS} active={active} />

      <section id="hero" className="slide slide-hero">
        <p className="eyebrow reveal">Machine Learning · Spotify API · KNN</p>
        <h1 className="hero-title reveal">Spotify Recommendation<br />System</h1>
        <p className="hero-sub reveal">
          89,584 tracks. 123 dimensions.<br />Recommendations shaped to your taste.
        </p>
        <div className="hero-actions reveal">
          <button className="btn-outline" onClick={scrollToTrial}>
            Jump to Trial ↓
          </button>
          {token ? (
            <span className="status-badge">
              <SpotifyIcon /> Spotify connected
            </span>
          ) : (
            <a className="btn-spotify" href="/auth/login">
              <SpotifyIcon /> Connect with Spotify
            </a>
          )}
        </div>
      </section>

      <section id="trial" className="slide">
        <p className="eyebrow reveal">Live Trial</p>
        <h2 className="section-title reveal">Your sound,<br />discovered.</h2>
        {token ? (
          <DemoSection token={token} onTokenClear={clearToken} />
        ) : (
          <div className="trial-connect reveal">
            <p className="section-sub" style={{ marginBottom: 24 }}>
              Connect your Spotify account to generate<br />recommendations from your top 50 tracks.
            </p>
            <a className="btn-spotify" href="/auth/login">
              <SpotifyIcon /> Connect with Spotify
            </a>
          </div>
        )}
      </section>
    </>
  )
}
