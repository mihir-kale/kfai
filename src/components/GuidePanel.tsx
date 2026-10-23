import { useEffect } from 'react'
import type { Alum } from '../lib/types'
import { realmOf } from '../lib/drafts'
import { copyText } from '../lib/store'

type Props = {
  open: boolean
  alum: Alum | null
  onClose: () => void
  onToast: (msg: string) => void
}

export default function GuidePanel({ open, alum, onClose, onToast }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const realm = alum ? realmOf(alum) : null

  const copyProbes = async () => {
    if (!realm) return
    const text = [`${realm.label} — interview questions`, '', ...realm.probes.map((q, i) => `${i + 1}. ${q}`)].join(
      '\n',
    )
    const ok = await copyText(text)
    onToast(ok ? 'Questions copied' : 'Copy failed')
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Interview guide">
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <h2>Interview &amp; information-gathering guide</h2>
            <p>
              Workstream B — Employer &amp; Industry Shift. The goal is specific, concrete shifts
              you can trace to a curriculum recommendation.
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close guide">
            ×
          </button>
        </div>

        <div className="drawer-body">
          {realm && (
            <div className="realm-card" style={{ marginBottom: 22 }}>
              <h4>{realm.label} — where to push</h4>
              <p>
                <b>How this realm differs.</b> {realm.aiAngle}
              </p>
              <p>
                <b>Commoditization hypothesis.</b> {realm.commoditized}
              </p>
              <p>
                <b>Test in follow-up.</b> {realm.signal}.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn" onClick={copyProbes}>
                  Copy these questions
                </button>
              </div>
            </div>
          )}

          <div className="guide-section">
            <h3>Key takeaways to aim for</h3>
            <ol>
              <li>
                How the hiring rubric itself is changing — what's weighted more heavily now, and
                what's weighted less.
              </li>
              <li>How day-to-day work has changed for someone in this role because of AI tools.</li>
              <li>
                Which specific skills or tools are now expected of new hires that weren't a
                requirement a few years ago.
              </li>
              <li>
                Which traditionally valued skills are becoming less differentiating because AI has
                commoditized them.
              </li>
              <li>
                How this realm's relationship with AI differs from other business functions — avoid
                treating "employers" as one undifferentiated group.
              </li>
              <li>
                What this person would want to see from UNC's curriculum, in their own words, to
                better prepare students for the roles they're hiring for.
              </li>
            </ol>
          </div>

          <div className="guide-section">
            <h3>{realm ? `${realm.label} probes` : 'Sample questions'}</h3>
            <ol>
              {(realm
                ? realm.probes
                : [
                    'Has AI changed what you look for on a resume or in an interview? How?',
                    'What does a strong entry-level candidate look like today versus two or three years ago?',
                    'Are there any red flags you are seeing more of now — like over-reliance on AI output without being able to verify it?',
                    'Walk me through how AI tools show up in your day-to-day work.',
                    'What tasks that used to take junior staff significant time are now automated or accelerated?',
                    'What skills do you wish new hires had that they currently do not?',
                    'Are there skills that used to matter a lot that matter less now?',
                    'What would you want UNC students to learn or practice before they graduate?',
                  ]
              ).map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </div>

          <div className="guide-section">
            <h3>Recruiting &amp; evaluation</h3>
            <ul>
              <li>Has AI changed what you look for on a resume or in an interview? How?</li>
              <li>
                What does a strong entry-level candidate look like today versus two or three years
                ago?
              </li>
              <li>
                Are there red flags you're seeing more of now — like over-reliance on AI output
                without being able to verify it?
              </li>
            </ul>
          </div>

          <div className="guide-section">
            <h3>The work itself</h3>
            <ul>
              <li>Walk me through how AI tools show up in your day-to-day work.</li>
              <li>
                What tasks that used to take junior staff significant time are now automated or
                accelerated?
              </li>
            </ul>
          </div>

          <div className="guide-section">
            <h3>Skills &amp; curriculum</h3>
            <ul>
              <li>What skills do you wish new hires had that they currently don't?</li>
              <li>Are there skills that used to matter a lot that matter less now?</li>
              <li>What would you want UNC students to learn or practice before they graduate?</li>
            </ul>
          </div>

          <div className="guide-section">
            <h3>Reminder</h3>
            <div className="callout">
              Push past generic answers like "AI is changing everything." The goal is specific,
              concrete shifts you can trace directly to a curriculum or skill-building
              recommendation.
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
