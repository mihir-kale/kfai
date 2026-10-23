import { useState } from 'react'
import { supabase } from '../lib/supabase'

const QUESTIONS = [
  {
    id: 'rubric',
    label: 'Has AI changed what you look for on a resume or in an interview? How?',
    type: 'textarea',
  },
  {
    id: 'candidate',
    label: 'What does a strong entry-level candidate look like today versus two or three years ago?',
    type: 'textarea',
  },
  {
    id: 'redflags',
    label: 'Are there any red flags you are seeing more of now — like over-reliance on AI output without being able to verify it?',
    type: 'textarea',
  },
  {
    id: 'daytoday',
    label: 'Walk me through how AI tools show up in your day-to-day work.',
    type: 'textarea',
  },
  {
    id: 'automated',
    label: 'What tasks that used to take junior staff significant time are now automated or accelerated?',
    type: 'textarea',
  },
  {
    id: 'skills',
    label: 'What skills do you wish new hires had that they currently don\'t?',
    type: 'textarea',
  },
  {
    id: 'commoditized',
    label: 'Are there skills that used to matter a lot that matter less now?',
    type: 'textarea',
  },
  {
    id: 'curriculum',
    label: 'What would you want UNC students to learn or practice before they graduate?',
    type: 'textarea',
  },
  {
    id: 'realm',
    label: 'How does this function\'s relationship with AI differ from other business functions?',
    type: 'textarea',
  },
]

export default function Survey() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [employer, setEmployer] = useState('')
  const [title, setTitle] = useState('')
  const [realm, setRealm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('survey_responses').insert({
      respondent_name: name,
      respondent_email: email,
      employer,
      title,
      realm,
      answers: form,
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setSubmitted(true)
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="gate">
        <div className="gate-card" style={{ textAlign: 'center' }}>
          <div className="gate-mark">✓</div>
          <h1>Thank you</h1>
          <p>
            Your responses have been recorded. We may follow up for a deeper conversation.
          </p>
          <button
            className="btn primary"
            onClick={() => {
              setSubmitted(false)
              setForm({})
              setName('')
              setEmail('')
              setEmployer('')
              setTitle('')
              setRealm('')
            }}
            style={{ marginTop: 16 }}
          >
            Submit another response
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <h1>Kenan-Flagler Future of Work Survey</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
        Research survey: how AI is reshaping what employers look for and how work gets done.
        Your responses help inform UNC Kenan-Flagler's curriculum.
      </p>

      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--line)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--line)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Employer
            </label>
            <input
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--line)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Title / Role
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--line)' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Your business function
          </label>
          <select
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--line)' }}
          >
            <option value="">Select…</option>
            <option value="ib">Investment Banking</option>
            <option value="consulting">Consulting</option>
            <option value="sales">Sales</option>
            <option value="asset">Asset &amp; Wealth Mgmt</option>
            <option value="pe">Private Equity / VC</option>
            <option value="corpfin">Corporate Finance</option>
            <option value="accounting">Accounting</option>
            <option value="marketing">Marketing</option>
            <option value="product">Product &amp; Tech</option>
            <option value="ops">Operations</option>
            <option value="realestate">Real Estate</option>
            <option value="healthcare">Healthcare</option>
            <option value="other">Other</option>
          </select>
        </div>

        {QUESTIONS.map((q) => (
          <div key={q.id} style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              {q.label}
            </label>
            <textarea
              value={form[q.id] || ''}
              onChange={(e) => setForm((f) => ({ ...f, [q.id]: e.target.value }))}
              rows={4}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid var(--line)',
                fontFamily: 'inherit',
                fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>
        ))}

        {error && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', padding: 10, borderRadius: 6, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn primary"
          disabled={submitting}
          style={{ width: '100%', padding: 12, fontSize: 14 }}
        >
          {submitting ? 'Submitting…' : 'Submit survey'}
        </button>
      </form>
    </div>
  )
}
