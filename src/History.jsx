import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'
import './History.css'

function History() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
        return
      }
      setUser(session.user)
      fetchAnalyses()
    })
  }, [])

  const fetchAnalyses = async () => {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error.message)
    } else {
      setAnalyses(data || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const getVerdictClass = (verdict) => {
    if (!verdict) return 'weak'
    const v = verdict.toLowerCase()
    if (v === 'flawed') return 'flawed'
    if (v === 'weak') return 'weak'
    if (v === 'possible') return 'possible'
    if (v === 'strong') return 'strong'
    if (v === 'ready') return 'ready'
    return 'weak'
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#ADFF2F'
    if (score >= 45) return '#6D00FF'
    return '#FF6B2B'
  }

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / analyses.length)
    : 0

  const bestScore = analyses.length
    ? Math.max(...analyses.map(a => a.overall_score || 0))
    : 0

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="history-wrapper">

      {/* NAVBAR */}
      <nav className="h-navbar">
        <div className="h-logo-group" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="h-logo-mark">
            <span>◆</span>
          </div>
          <span className="h-logo-text">techfinehub</span>
        </div>
        <div className="h-nav-right">
          <span className="h-email">{user?.email}</span>
          <div className="h-logout" onClick={handleLogout}>Logout</div>
        </div>
      </nav>

      <div className="history-container">

        {/* HEADER */}
        <div className="history-header">
          <div>
            <h1 className="history-title">Your Ideas</h1>
            <p className="history-sub">Every idea you've analyzed — your thinking record.</p>
          </div>
          <div className="new-idea-btn" onClick={() => navigate('/')}>
            + New analysis
          </div>
        </div>

        {/* STATS ROW */}
        {analyses.length > 0 && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-card-num">{analyses.length}</div>
              <div className="stat-card-label">Ideas analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num" style={{ color: '#6D00FF' }}>{avgScore}</div>
              <div className="stat-card-label">Average score</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num" style={{ color: '#ADFF2F' }}>{bestScore}</div>
              <div className="stat-card-label">Best score</div>
            </div>
          </div>
        )}

        {/* ANALYSES LIST */}
        {loading ? (
          <div className="history-loading">
            <p>Loading your analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">🧠</div>
            <h2>No analyses yet</h2>
            <p>Submit your first idea and we'll analyze it deeply.</p>
            <div className="new-idea-btn" onClick={() => navigate('/')}>
              Analyze your first idea →
            </div>
          </div>
        ) : (
          <div className="analyses-list">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="analysis-card"
                onClick={() => navigate('/result', { state: { analysis: analysis.full_result } })}
              >
                <div className="analysis-card-left">
                  <div className="analysis-score" style={{ borderColor: getScoreColor(analysis.overall_score) }}>
                    <span className="score-num" style={{ color: getScoreColor(analysis.overall_score) }}>
                      {analysis.overall_score}
                    </span>
                    <span className="score-max">/100</span>
                  </div>
                </div>

                <div className="analysis-card-middle">
                  <p className="analysis-summary">{analysis.idea_summary}</p>
                  <p className="analysis-idea-text">{analysis.idea_text?.slice(0, 100)}...</p>
                  <span className="analysis-date">{formatDate(analysis.created_at)}</span>
                </div>

                <div className="analysis-card-right">
                  <div className={`verdict-badge ${getVerdictClass(analysis.verdict)}`}>
                    {analysis.verdict}
                  </div>
                  <div className="view-arrow">→</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default History