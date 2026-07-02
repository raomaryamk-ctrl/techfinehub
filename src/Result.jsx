import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import './Result.css'

function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const analysis = location.state?.analysis
  const analysisId = location.state?.analysisId
  const [completedSteps, setCompletedSteps] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load completed steps if analysisId is available
    if (analysisId) {
      loadCompletedSteps()
    }
  }, [analysisId])

  const loadCompletedSteps = async () => {
    const { data, error } = await supabase
      .from('analyses')
      .select('completed_steps')
      .eq('id', analysisId)
      .single()

    if (!error && data?.completed_steps) {
      setCompletedSteps(data.completed_steps)
    }
  }

  const toggleStep = async (stepNum) => {
    const isCompleted = completedSteps.includes(stepNum)
    const updated = isCompleted
      ? completedSteps.filter(s => s !== stepNum)
      : [...completedSteps, stepNum]

    setCompletedSteps(updated)

    if (analysisId) {
      setSaving(true)
      await supabase
        .from('analyses')
        .update({ completed_steps: updated })
        .eq('id', analysisId)
      setSaving(false)
    }
  }

  const completedCount = completedSteps.length
  const totalSteps = analysis?.strategy?.length || 0
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  if (!analysis) {
    return (
      <div className="result-wrapper">
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontSize: '14px', marginBottom: '16px' }}>
            No analysis found. Please submit an idea first.
          </p>
          <div className="primary-btn" style={{ display: 'inline-block', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span>Go back →</span>
          </div>
        </div>
      </div>
    )
  }

  const verdictClass = analysis.verdict?.toLowerCase() || 'flawed'

  const tagClass = (tag) => {
    if (tag === 'CRITICAL') return 'critical'
    if (tag === 'WEAK') return 'weak'
    if (tag === 'POSSIBLE') return 'possible'
    if (tag === 'STRONG') return 'possible'
    return 'weak'
  }

  const barColor = (tag) => {
    if (tag === 'CRITICAL') return 'orange'
    return 'violet'
  }

  const scoreColor = (tag) => {
    if (tag === 'CRITICAL') return 'orange'
    return 'violet'
  }

  const gapTagClass = (severity) => {
    if (severity === 'CRITICAL') return 'critical'
    if (severity === 'MODERATE') return 'moderate'
    return 'minor'
  }

  return (
    <div className="result-wrapper">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-group">
          <div className="logo-mark">
            <span className="logo-icon">◆</span>
          </div>
          <span className="logo-text">techfinehub</span>
        </div>
        <div className="nav-right">
          <div className="analysis-id">
            <span>📄 Live analysis</span>
          </div>
          <div className="nav-cta" onClick={() => navigate('/history')} style={{ cursor: 'pointer' }}>
            <span>My Ideas</span>
          </div>
          <div className="nav-cta" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span>New analysis</span>
          </div>
        </div>
      </nav>

      {/* IDEA SNAPSHOT + SCORE */}
      <section className="snapshot-section">
        <div className="snapshot-top">
          <div className="idea-block">
            <div className="block-label">IDEA SUBMITTED</div>
            <p className="idea-text">"{analysis.ideaSummary}"</p>
          </div>

          <div className="verdict-block">
            <div className="block-label center">OVERALL VERDICT</div>
            <div className="score-circle">
              <span className="score-num">{analysis.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
            <div className={`verdict-tag ${verdictClass}`}>
              <span>{analysis.verdict}</span>
            </div>
          </div>
        </div>

        <div className="tool-read">
          <span className="alert-icon">⚠</span>
          <p>
            <strong>Tool's read:</strong> {analysis.toolsRead}
          </p>
        </div>
      </section>

      {/* 5 DIMENSION BREAKDOWN */}
      <section className="dimensions-section">
        <div className="section-label">5 DIMENSION BREAKDOWN</div>

        {analysis.dimensions?.map((dim, i) => (
          <div className="dimension-row" key={i}>
            <div className="dim-header">
              <div className="dim-left">
                <span className="dim-name">{dim.name}</span>
                <span className="dim-q">— {dim.question}</span>
              </div>
              <div className="dim-right">
                <span className={`dim-score ${scoreColor(dim.tag)}`}>{dim.score}/100</span>
                <span className={`dim-tag ${tagClass(dim.tag)}`}>{dim.tag}</span>
              </div>
            </div>
            <div className="dim-bar-track">
              <div className={`dim-bar-fill ${barColor(dim.tag)}`} style={{ width: `${dim.score}%` }}></div>
            </div>
            <p className="dim-desc">{dim.explanation}</p>
          </div>
        ))}
      </section>

      {/* CRITICAL GAPS FOUND */}
      <section className="gaps-section">
        <div className="section-label">GAPS FOUND — {analysis.gaps?.length || 0} ISSUES</div>

        {analysis.gaps?.map((gap, i) => (
          <div className="gap-card" key={i}>
            <div className={`gap-tag ${gapTagClass(gap.severity)}`}>{gap.severity}</div>
            <div className="gap-content">
              <p className="gap-title">{gap.title}</p>
              <p className="gap-desc">{gap.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* REBUILT STRATEGY — WITH TRACKING */}
      <section className="strategy-section">
        <div className="strategy-header">
          <div>
            <div className="section-label light">REBUILT STRATEGY</div>
            <p className="strategy-sub">
              Your fixed, step-by-step execution plan — check each step as you complete it
            </p>
          </div>

          {/* PROGRESS BAR */}
          {totalSteps > 0 && (
            <div className="progress-wrap">
              <div className="progress-label">
                <span>{completedCount}/{totalSteps} steps done</span>
                <span className="progress-percent">{progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {saving && <span className="saving-text">Saving...</span>}
            </div>
          )}
        </div>

        <div className="strategy-steps">
          {analysis.strategy?.map((step, i) => {
            const isDone = completedSteps.includes(step.step)
            return (
              <div
                key={i}
                className={`strategy-step ${isDone ? 'step-done' : ''}`}
                onClick={() => toggleStep(step.step)}
              >
                <div className={`step-check ${isDone ? 'checked' : ''}`}>
                  {isDone ? '✓' : step.step}
                </div>
                <div className="step-content">
                  <p className={`step-title ${isDone ? 'done-text' : ''}`}>{step.title}</p>
                  <p className="step-desc">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {progressPercent === 100 && (
          <div className="all-done-banner">
            🎉 All steps completed! Your idea is in motion.
          </div>
        )}
      </section>

      {/* BOTTOM ACTION BAR */}
      <footer className="action-footer">
        <div className="footer-text">
          <p className="footer-title">
            {progressPercent === 100
              ? '🎉 All done! Start your next idea.'
              : `${completedCount} of ${totalSteps} steps completed`}
          </p>
          <p className="footer-sub">Click any step to mark it done — progress saves automatically</p>
        </div>
        <div className="footer-actions">
          <div className="ghost-btn" onClick={() => navigate('/history')} style={{ cursor: 'pointer' }}>
            <span>My Ideas</span>
          </div>
          <div className="ghost-btn" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span>Analyze new idea</span>
          </div>
          <div className="primary-btn" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span>New analysis →</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Result