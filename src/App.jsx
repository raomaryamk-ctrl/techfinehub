import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Result from './Result.jsx'
import Login from './Login.jsx'
import History from './History.jsx'
import { supabase } from './supabaseClient.js'

function Home() {
  const navigate = useNavigate()
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleAnalyze = async () => {
    if (idea.trim().length < 10) {
      setError('Please write a more detailed idea (at least 10 characters).')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Step 1 — Get AI analysis
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()

      // Step 2 — Save to Supabase and get the saved ID
      let savedId = null
      if (user) {
        const { data: saved, error: saveError } = await supabase
          .from('analyses')
          .insert({
            user_id: user.id,
            idea_text: idea,
            idea_summary: data.ideaSummary,
            overall_score: data.overallScore,
            verdict: data.verdict,
            full_result: data,
          })
          .select('id')
          .single()

        if (saveError) {
          console.error('Save error:', saveError.message)
        } else {
          savedId = saved?.id
        }
      }

      // Step 3 — Navigate to result with analysis data AND savedId for tracking
      navigate('/result', { state: { analysis: data, analysisId: savedId } })

    } catch (err) {
      console.error(err)
      setError('Something went wrong. Make sure the backend server is running, then try again.')
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-group">
          <div className="logo-mark">
            <span className="logo-icon">◆</span>
          </div>
          <span className="logo-text">techfinehub</span>
        </div>
        <div className="nav-links">
          <span className="nav-link">How it works</span>
          <span className="nav-link">Examples</span>
          {user ? (
            <div className="nav-user">
              <span
                className="nav-my-ideas"
                onClick={() => navigate('/history')}
              >
                My Ideas
              </span>
              <span className="nav-email">{user.email}</span>
              <div className="nav-logout" onClick={handleLogout}>
                <span>Logout</span>
              </div>
            </div>
          ) : (
            <div className="nav-cta" onClick={() => navigate('/login')}>
              <span>Get started</span>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-tag">
          <span>IDEA ANALYZER — BUILT FOR THINKERS</span>
        </div>

        <h1 className="hero-title">
          Most ideas fail silently.<br />
          <span className="highlight">Yours won't.</span>
        </h1>

        <p className="hero-sub">
          Paste your raw idea or plan. We find every gap, weak point, and blind spot —
          then rebuild a strategy that actually holds.
        </p>

        {/* INPUT BOX */}
        <div className="input-wrap">
          <div className="input-label">WHAT IS YOUR IDEA OR PLAN?</div>
          <textarea
            className="idea-box"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Write your idea, plan, or goal here. Raw ideas reveal the most gaps — don't polish it."
            disabled={loading}
          />
          {error && <p className="error-text">{error}</p>}
          <div className="input-footer">
            <div className="input-hint">
              <span>🔒 Private — never shared</span>
            </div>
            <div
              className={`analyze-btn ${loading ? 'loading' : ''}`}
              onClick={loading ? undefined : handleAnalyze}
            >
              <span>{loading ? 'Analyzing your idea...' : 'Run deep analysis'}</span>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-num">30s</div>
            <div className="stat-label">RESULTS</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">5</div>
            <div className="stat-label">DIMENSIONS</div>
          </div>
          <div className="stat-item">
            <div className="stat-num purple">/100</div>
            <div className="stat-label">HONEST SCORE</div>
          </div>
          <div className="stat-item">
            <div className="stat-num arrow">→</div>
            <div className="stat-label">REBUILT PLAN</div>
          </div>
        </div>
      </section>

      {/* WHERE IDEAS BREAK DOWN */}
      <section className="breakdown-section">
        <div className="section-label">WHERE MOST IDEAS ACTUALLY BREAK DOWN</div>
        <div className="cards-grid">

          <div className="card card-violet">
            <div className="card-icon icon-violet">🔍</div>
            <div className="card-title">Blind spots</div>
            <div className="card-desc">Risks you never saw — market, timing, competition, resources.</div>
            <div className="card-tag tag-violet"><span>MOST COMMON</span></div>
          </div>

          <div className="card card-orange">
            <div className="card-icon icon-orange">⚠️</div>
            <div className="card-title">Wrong assumptions</div>
            <div className="card-desc">Every unverified assumption is a hidden risk waiting to collapse.</div>
            <div className="card-tag tag-orange"><span>SILENT KILLER</span></div>
          </div>

          <div className="card card-lime">
            <div className="card-icon icon-lime">🧩</div>
            <div className="card-title">Missing pieces</div>
            <div className="card-desc">The steps between idea and goal you skipped without knowing.</div>
            <div className="card-tag tag-lime"><span>GAP ANALYSIS</span></div>
          </div>

          <div className="card card-output">
            <div className="card-icon icon-output">↗️</div>
            <div className="card-title">Rebuilt for you</div>
            <div className="card-desc">Fixed gaps, corrected strategy, step by step — ready to execute.</div>
            <div className="card-tag tag-output"><span>YOUR OUTPUT</span></div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-bar">
        <span>techfinehub.online</span>
        <div className="footer-status">
          <div className="live-dot"></div>
          <span>building in public</span>
        </div>
      </footer>

    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App