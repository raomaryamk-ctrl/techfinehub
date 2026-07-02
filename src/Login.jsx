import { useState } from 'react'
import { supabase } from './supabaseClient.js'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    setLoading(false)

    if (error) {
      setError('Something went wrong. Please try again.')
      console.error(error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-logo">
          <div className="logo-mark">
            <span className="logo-icon">◆</span>
          </div>
          <span className="logo-text">techfinehub</span>
        </div>

        {!sent ? (
          <>
            <h2 className="login-title">Sign in to continue</h2>
            <p className="login-sub">
              We'll email you a magic link — no password needed.
            </p>

            <div className="login-input-wrap">
              <input
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {error && <p className="login-error">{error}</p>}
            </div>

            <div
              className={`login-btn ${loading ? 'loading' : ''}`}
              onClick={loading ? undefined : handleLogin}
            >
              <span>{loading ? 'Sending link...' : 'Send magic link'}</span>
            </div>
          </>
        ) : (
          <div className="login-success">
            <div className="success-icon">✉️</div>
            <h2 className="login-title">Check your email</h2>
            <p className="login-sub">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Login