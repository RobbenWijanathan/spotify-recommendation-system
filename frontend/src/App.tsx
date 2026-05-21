import { useEffect, useRef, useState } from 'react'
import NavDots from './components/NavDots'
import DemoSection from './components/DemoSection'
import './App.css'

const SECTIONS = [
  'hero', 'dataset', 'cleaning', 'features',
  'pca', 'model', 'evaluation', 'pipeline', 'demo',
]

const PCA_DATA = [
  { label: 'PC1', pct: 100, display: '18.67%' },
  { label: 'PC2', pct: 53,  display: '9.82%'  },
  { label: 'PC3', pct: 48,  display: '8.88%'  },
  { label: 'PC4', pct: 41,  display: '7.63%'  },
  { label: 'PC5', pct: 37,  display: '6.84%'  },
  { label: 'PC6', pct: 35,  display: '6.58%'  },
  { label: 'PC7', pct: 33,  display: '6.17%'  },
  { label: 'PC8', pct: 30,  display: '5.61%'  },
  { label: 'PC9', pct: 30,  display: '5.52%'  },
]

const EVAL_DIST = [
  { range: '0–10%',   pct: 51,  count: '58 tracks'  },
  { range: '10–30%',  pct: 100, count: '113 tracks' },
  { range: '30–50%',  pct: 90,  count: '102 tracks' },
  { range: '50–70%',  pct: 65,  count: '73 tracks'  },
  { range: '70–100%', pct: 96,  count: '109 tracks' },
]

const PIPELINE_STEPS = [
  { num: '01', icon: '♫', label: 'Spotify OAuth',       desc: 'Authenticate and grant access',                         variant: 'spotify' },
  { num: '02', icon: '▶', label: 'Top 50 Tracks',       desc: 'Fetched via Spotify API (medium term)',                  variant: 'spotify' },
  { num: '03', icon: '⬡', label: 'Name Lookup',         desc: 'Match track names to KNN index — 73,472 entries',       variant: ''        },
  { num: '04', icon: '⊕', label: 'Taste Profile',       desc: 'Centroid of matched feature vectors in 9D space',       variant: 'active'  },
  { num: '05', icon: '◎', label: 'KNN Cosine Search',   desc: 'Find N nearest neighbors in L2-normalized space',        variant: 'active'  },
  { num: '06', icon: '✦', label: 'Recommendations',     desc: 'Ranked by cosine similarity score',                     variant: ''        },
]

const FEATURES = [
  { name: 'popularity',        weight: '×1', type: '' },
  { name: 'duration_ms',       weight: '×1', type: '' },
  { name: 'danceability',      weight: '×1', type: '' },
  { name: 'energy',            weight: '×1', type: '' },
  { name: 'loudness',          weight: '×1', type: '' },
  { name: 'speechiness',       weight: '×1', type: '' },
  { name: 'acousticness',      weight: '×1', type: '' },
  { name: 'instrumentalness',  weight: '×1', type: '' },
  { name: 'liveness',          weight: '×1', type: '' },
  { name: 'valence',           weight: '×1', type: '' },
  { name: 'tempo',             weight: '×1', type: '' },
  { name: 'key',               weight: '×1', type: '' },
  { name: 'mode',              weight: '×3', type: 'weighted' },
  { name: 'time_signature',    weight: '×1', type: '' },
  { name: 'explicit',          weight: '×1', type: '' },
  { name: 'genre_encoded',     weight: '×5', type: 'genre' },
]

function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1100, 1)
        setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{value.toLocaleString()}</span>
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      setTimeout(() => setWidth(pct), 80)
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [pct])

  return (
    <div ref={ref} className="bar-track">
      <div className="bar-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  )
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

export default function App() {
  const [active, setActive] = useState(0)

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
  }, [])

  return (
    <>
      <NavDots sections={SECTIONS} active={active} />

      <section id="hero" className="slide slide-hero">
        <p className="eyebrow reveal">KNN · Cosine Similarity · Spotify API</p>
        <h1 className="hero-title reveal">Music<br />Intelligence</h1>
        <p className="hero-sub reveal">
          89,584 songs. 9 dimensions.<br />Your next favorite, scientifically found.
        </p>
        <a className="btn-spotify reveal" href="/auth/login">
          <SpotifyIcon />
          Connect with Spotify
        </a>
      </section>

      <section id="dataset" className="slide">
        <p className="eyebrow reveal">The Data</p>
        <h2 className="section-title reveal">Raw material.</h2>
        <p className="section-sub reveal">
          Sourced from Spotify's catalog. 114 genres, 1,000 tracks each.
        </p>
        <div className="stat-grid reveal">
          <div className="stat-card">
            <div className="stat-number"><CountUp target={89584} /></div>
            <div className="stat-label">Cleaned tracks</div>
          </div>
          <div className="stat-card">
            <div className="stat-number"><CountUp target={113} /></div>
            <div className="stat-label">Unique genres</div>
          </div>
          <div className="stat-card">
            <div className="stat-number"><CountUp target={16} /></div>
            <div className="stat-label">Audio features</div>
          </div>
        </div>
      </section>

      <section id="cleaning" className="slide slide-alt">
        <p className="eyebrow reveal">Data Preparation</p>
        <h2 className="section-title reveal">Noise removed.<br />Signal amplified.</h2>
        <div className="flow-row reveal">
          <div className="flow-step">
            <div className="flow-num dim">114,001</div>
            <div className="flow-label">Raw tracks</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-num mid">89,741</div>
            <div className="flow-label">After dedup by track ID</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-num">89,584</div>
            <div className="flow-label">After zero-tempo filter</div>
          </div>
        </div>
        <div className="pill-row reveal">
          <span className="pill">1 null track name</span>
          <span className="pill">1 null artist</span>
          <span className="pill">157 zero-tempo tracks</span>
          <span className="pill">no duplicate IDs</span>
        </div>
      </section>

      <section id="features" className="slide">
        <p className="eyebrow reveal">Feature Engineering</p>
        <h2 className="section-title reveal">Every song, measured.</h2>
        <div className="feature-grid reveal">
          {FEATURES.map(f => (
            <div key={f.name} className={`feature-pill ${f.type}`}>
              <span className="feature-name">{f.name}</span>
              <span className="feature-weight">weight {f.weight}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="pca" className="slide slide-alt">
        <p className="eyebrow reveal">Dimensionality Reduction</p>
        <h2 className="section-title reveal">16 dimensions<br />down to 9.</h2>
        <div className="pca-container reveal">
          {PCA_DATA.map(d => (
            <div key={d.label} className="pca-row">
              <span className="pca-label">{d.label}</span>
              <AnimatedBar pct={d.pct} color="rgba(106, 136, 166, 0.7)" />
              <span className="pca-pct">{d.display}</span>
            </div>
          ))}
          <p className="pca-total">Total variance retained: <strong>91.75%</strong></p>
        </div>
      </section>

      <section id="model" className="slide">
        <p className="eyebrow reveal">The Model</p>
        <h2 className="section-title reveal">Finding neighbors<br />in nine dimensions.</h2>
        <div className="model-grid reveal">
          {([
            ['Algorithm',     'KNN'],
            ['Metric',        'Cosine Similarity'],
            ['Search',        'Brute Force'],
            ['Normalization', 'L2 Unit Vectors'],
            ['Index Size',    '89,584 tracks'],
            ['Dimensions',    '9 (post-PCA)'],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="model-card">
              <div className="model-card-label">{label}</div>
              <div className="model-card-value">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="evaluation" className="slide slide-alt">
        <p className="eyebrow reveal">Performance</p>
        <div className="eval-hero reveal">
          <div className="eval-big">51.3×</div>
          <div className="eval-sub">
            lift over random baseline · Mean Precision@10: <strong>0.4498</strong>
          </div>
        </div>
        <div className="dist-table reveal">
          {EVAL_DIST.map((d, i) => (
            <div key={d.range} className="dist-row">
              <span className="dist-range">{d.range}</span>
              <AnimatedBar
                pct={d.pct}
                color={`rgba(232, 229, 222, ${0.15 + i * 0.15})`}
              />
              <span className="dist-count">{d.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="pipeline" className="slide">
        <p className="eyebrow reveal">End-to-End Pipeline</p>
        <h2 className="section-title reveal">From your taste<br />to your next favorite.</h2>
        <div className="pipeline-flow reveal">
          {PIPELINE_STEPS.map(step => (
            <div key={step.label} className={`pipe-node ${step.variant}`}>
              <span className="pipe-num">{step.num}</span>
              <span className="pipe-icon">{step.icon}</span>
              <div>
                <div className="pipe-name">{step.label}</div>
                <div className="pipe-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="slide slide-alt">
        <p className="eyebrow reveal">Live Demo</p>
        <h2 className="section-title reveal">Your sound,<br />discovered.</h2>
        <DemoSection />
      </section>
    </>
  )
}
