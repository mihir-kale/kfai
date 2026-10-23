import { useState } from 'react'
import type { EncryptedPayload } from '../lib/types'

type Props = {
  payload: EncryptedPayload
  error: string | null
  busy: boolean
  onUnlock: (passphrase: string) => void
}

export default function UnlockGate({ payload, error, busy, onUnlock }: Props) {
  const [passphrase, setPassphrase] = useState('')

  return (
    <div className="gate">
      <div className="gate-card">
        <div className="gate-mark">UBP</div>
        <h1>Alumni Outreach</h1>
        <p>
          Workstream B — Employer &amp; Industry Shift. This dataset is encrypted in the app
          itself; nothing loads until you enter the team passphrase.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (passphrase.trim()) onUnlock(passphrase)
          }}
        >
          <label htmlFor="passphrase">Team passphrase</label>
          <input
            id="passphrase"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="••••••••••"
          />
          <button className="btn primary" type="submit" disabled={busy || !passphrase.trim()}>
            {busy ? 'Decrypting…' : 'Unlock'}
          </button>
        </form>

        {error && <div className="gate-error">{error}</div>}

        {payload.meta.demo && (
          <div className="gate-note">
            <b>Demo dataset.</b> {payload.meta.count} sample records — passphrase{' '}
            <code>ubp-demo</code>. Replace with the real export before sharing.
          </div>
        )}

        <div className="gate-foot">
          {payload.meta.count.toLocaleString()} alumni records · generated{' '}
          {new Date(payload.meta.generatedAt).toLocaleDateString()} · AES-256-GCM
          <br />
          Decryption happens in your browser. The passphrase is never sent anywhere.
        </div>
      </div>
    </div>
  )
}
