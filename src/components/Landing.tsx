import { useState } from 'react'
import Survey from './Survey'
import AuthGate from './AuthGate'
import App from '../App'

export default function Landing() {
  const [view, setView] = useState<'home' | 'survey' | 'app'>('home')

  if (view === 'survey') return <Survey />
  if (view === 'app') return <AuthGate><App /></AuthGate>

  return (
    <>
      <header style={{ background: '#4B9CD3', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/kfai/logo.png" alt="Kenan-Flagler Business School" style={{ height: 40 }} />
          <h1 style={{ color: '#fff', fontSize: 22, margin: 0, fontWeight: 600 }}>Future of Work Survey</h1>
        </div>
        <button onClick={() => setView('app')} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Team Member Login</button>
      </header>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
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
            Click here to fill out the survey
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
    </>
  )
}
