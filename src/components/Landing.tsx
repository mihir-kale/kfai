import { useState } from 'react'
import Survey from './Survey'
import AuthGate from './AuthGate'
import App from '../App'

export default function Landing() {
  const [view, setView] = useState<'home' | 'survey' | 'app'>('home')

  if (view === 'survey') return <Survey />
  if (view === 'app') return <AuthGate><App /></AuthGate>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, background: '#4B9CD3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/kfai/logo.png" alt="Kenan-Flagler Business School" style={{ maxWidth: '60%', maxHeight: '60%' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', background: '#fff' }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, color: '#13294B' }}>Future of Work Survey</h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 32, maxWidth: 480 }}>
          Researching how AI is reshaping what employers look for and how work gets done.
        </p>
        <div
          onClick={() => setView('survey')}
          style={{
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 28,
            cursor: 'pointer',
            background: 'var(--card)',
            maxWidth: 480,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Take the survey</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Click here to fill out the survey
          </p>
          <button className="btn primary" style={{ marginTop: 12 }}>Start survey →</button>
        </div>
        <button onClick={() => setView('app')} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', padding: '12px 0', cursor: 'pointer', fontSize: 13, marginTop: 24, textAlign: 'left' }}>Team Member Login →</button>
      </div>
    </div>
  )
}
