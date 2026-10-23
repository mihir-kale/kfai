import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigningIn(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    }

    setSigningIn(false)
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="gate">
        <div className="gate-card">
          <img src="/kfai/logo.png" alt="Kenan-Flagler" style={{ height: 40, marginBottom: 16 }} />
          <h1>Supabase not configured</h1>
          <p>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your
            environment.
          </p>
          <div className="gate-foot">
            Create a <code>.env.local</code> file or set them in your GitHub Pages build.
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="gate">
        <div className="gate-card">
          <img src="/kfai/logo.png" alt="Kenan-Flagler" style={{ height: 40, marginBottom: 16 }} />
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="gate">
        <div className="gate-card">
          <img src="/kfai/logo.png" alt="Kenan-Flagler" style={{ height: 40, marginBottom: 16 }} />
          <h1>Team Portal</h1>

          <form onSubmit={signIn}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password" style={{ marginTop: 12 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn primary" type="submit" disabled={signingIn}>
              {signingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {error && <div className="gate-error">{error}</div>}


        </div>
      </div>
    )
  }

  return <>{children}</>
}
