import { useState } from 'react'
import Survey from './Survey'
import AuthGate from './AuthGate'
import App from '../App'

export default function Landing() {
  const [view, setView] = useState<'home' | 'survey' | 'app'>('home')

  if (view === 'survey') return <Survey />
  if (view === 'app') return <AuthGate><App /></AuthGate>

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px' }}>
      <img src="/kfai/logo.png" alt="Kenan-Flagler Business School" style={{ height: 48, marginBottom: 16 }} />
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Kenan-Flagler Future of Work Survey</h1>
      <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 48, maxWidth: 600 }}>
        Researching how AI is reshaping what employers look for and how work gets done.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div
          onClick={() => setView('survey')}
          style={{
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 28,
            cursor: 'pointer',
            background: 'var(--card)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Take the survey</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Short on time? Answer a few questions about how AI has changed hiring and day-to-day
            work in your function. Takes about 5 minutes.
          </p>
          <button className="btn primary" style={{ marginTop: 12 }}>Start survey →</button>
        </div>

        <div
          onClick={() => setView('app')}
          style={{
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 28,
            cursor: 'pointer',
            background: 'var(--card)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Team portal</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            For team members: filter alumni, draft outreach, and track interviews.
            Requires login.
          </p>
          <button className="btn" style={{ marginTop: 12 }}>Sign in →</button>
        </div>
      </div>
    </div>
  )
}
