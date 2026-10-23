import { useEffect, useMemo, useRef, useState } from 'react'
import type { Alum, OutreachStatus, Sender, StatusEntry } from '../lib/types'
import { buildDraft, mailto, realmOf, TEMPLATES, VARIANT_COUNT } from '../lib/drafts'
import type { TemplateId } from '../lib/types'
import {
  copyText,
  draftKey,
  loadDrafts,
  saveDrafts,
  STATUS_META,
  STATUS_ORDER,
} from '../lib/store'
import type { DraftMap } from '../lib/store'
import { REALM_TINT } from '../lib/ui'

type Props = {
  alum: Alum
  sender: Sender
  onSenderChange: (sender: Sender) => void
  statusEntry?: StatusEntry
  onStatus: (status: OutreachStatus) => void
  onClose: () => void
  onNext: () => void
  onToast: (msg: string) => void
  onOpenGuide: () => void
}

export default function DraftPanel({
  alum,
  sender,
  onSenderChange,
  statusEntry,
  onStatus,
  onClose,
  onNext,
  onToast,
  onOpenGuide,
}: Props) {
  const [template, setTemplate] = useState<TemplateId>('outreach')
  const [variant, setVariant] = useState(0)
  const [drafts, setDrafts] = useState<DraftMap>(() => loadDrafts())
  const [profileOpen, setProfileOpen] = useState(!sender.name)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const realm = realmOf(alum)
  const tint = REALM_TINT[alum.realm] ?? REALM_TINT.other
  const status = statusEntry?.status ?? 'new'
  const meta = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0]

  const base = useMemo(
    () => buildDraft(template, alum, sender, variant),
    [template, alum, sender, variant],
  )

  const key = draftKey(alum.id, template, variant)
  const draft = drafts[key] ?? base
  const edited = Boolean(drafts[key])

  // Reset scroll when moving to another person.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
    setProfileOpen((open) => (sender.name ? open : true))
  }, [alum.id, sender.name])

  const update = (patch: Partial<{ subject: string; body: string }>) => {
    const next: DraftMap = { ...drafts, [key]: { ...draft, ...patch } }
    setDrafts(next)
    saveDrafts(next)
  }

  const reset = () => {
    const next = { ...drafts }
    delete next[key]
    setDrafts(next)
    saveDrafts(next)
  }

  const copyBody = async () => {
    const ok = await copyText(draft.body)
    onToast(ok ? 'Email body copied' : 'Copy failed — select the text manually')
  }

  const copyAll = async () => {
    const ok = await copyText(`Subject: ${draft.subject}\n\n${draft.body}`)
    onToast(ok ? 'Subject and body copied' : 'Copy failed — select the text manually')
  }

  const copyEmail = async () => {
    if (!alum.email) return
    const ok = await copyText(alum.email)
    onToast(ok ? 'Email address copied' : 'Copy failed')
  }

  const updateSender = (patch: Partial<Sender>) => onSenderChange({ ...sender, ...patch })

  return (
    <section className="draft" aria-label={`Draft email for ${alum.name}`}>
      <div className="draft-head">
        <div className="draft-head-top">
          <div style={{ minWidth: 0 }}>
            <div className="draft-name">{alum.name}</div>
            <div className="draft-meta">
              {[alum.title, alum.employer].filter(Boolean).join(' · ') || 'No role on file'}
              {alum.classYear ? ` · Class of ${alum.classYear}` : ''}
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close draft panel">
            ×
          </button>
        </div>

        <div className="draft-email-row">
          <span className="draft-email" title={alum.email ?? ''}>
            {alum.email || 'No email on file'}
          </span>
          <span className="chip" style={{ background: tint.bg, color: tint.fg }}>
            {realm.label}
          </span>
          {alum.email && (
            <button className="icon-btn" onClick={copyEmail}>
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Email templates">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            role="tab"
            className="tab"
            aria-selected={template === t.id}
            onClick={() => {
              setTemplate(t.id)
              setVariant(0)
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="draft-body">
        <details
          className="sender-card"
          open={profileOpen}
          onToggle={(e) => setProfileOpen(e.currentTarget.open)}
        >
          <summary>Signing as{sender.name ? ` — ${sender.name}` : ''}</summary>
          <div className="sender-grid">
            <div>
              <label htmlFor="sender-name">Your name</label>
              <input
                id="sender-name"
                value={sender.name}
                onChange={(e) => updateSender({ name: e.target.value })}
                placeholder="Mihir Kale"
              />
            </div>
            <div>
              <label htmlFor="sender-year">Class year</label>
              <input
                id="sender-year"
                value={sender.classYear}
                onChange={(e) => updateSender({ classYear: e.target.value })}
                placeholder="2027"
              />
            </div>
            <div className="full">
              <label htmlFor="sender-email">Email signature</label>
              <input
                id="sender-email"
                value={sender.email}
                onChange={(e) => updateSender({ email: e.target.value })}
                placeholder="first_last@kenan-flagler.unc.edu"
              />
            </div>
            <div>
              <label htmlFor="sender-org">Program / org</label>
              <input
                id="sender-org"
                value={sender.org}
                onChange={(e) => updateSender({ org: e.target.value })}
                placeholder="Undergraduate Business Program"
              />
            </div>
            <div>
              <label htmlFor="sender-link">LinkedIn (optional)</label>
              <input
                id="sender-link"
                value={sender.link}
                onChange={(e) => updateSender({ link: e.target.value })}
                placeholder="linkedin.com/in/…"
              />
            </div>
          </div>
        </details>

        <div className="field-label">
          <span>{meta.label}</span>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {edited && (
              <button className="link-btn" onClick={reset}>
                Reset
              </button>
            )}
            <button
              className="link-btn"
              onClick={() => setVariant((v) => (v + 1) % VARIANT_COUNT)}
              title="Cycle opening, ask, and closer"
            >
              ↻ New angle {variant + 1}/{VARIANT_COUNT}
            </button>
          </span>
        </div>
        <p className="draft-hint">
          {meta.hint}. {realm.changed ? `Built around ${realm.changed}.` : ''}
        </p>

        <label className="field-label" htmlFor="draft-subject">
          Subject
        </label>
        <input
          id="draft-subject"
          className="subject-input"
          value={draft.subject}
          onChange={(e) => update({ subject: e.target.value })}
        />

        <label className="field-label" htmlFor="draft-body">
          Body
        </label>
        <textarea
          id="draft-body"
          ref={bodyRef}
          className="body-input"
          value={draft.body}
          onChange={(e) => update({ body: e.target.value })}
          spellCheck
        />

        <div style={{ marginTop: 10 }}>
          <button className="link-btn" onClick={onOpenGuide}>
            Open the Workstream B question guide for {realm.label} →
          </button>
        </div>
      </div>

      <div className="draft-foot">
        <div className="draft-actions">
          <button className="btn primary" onClick={copyAll} disabled={!alum.email}>
            Copy email
          </button>
          <button className="btn" onClick={copyBody}>
            Copy body
          </button>
          <a
            className="btn"
            href={alum.email ? mailto(alum, draft) : undefined}
            aria-disabled={!alum.email}
            onClick={(e) => {
              if (!alum.email) e.preventDefault()
              else onStatus(status === 'new' ? 'queued' : status)
            }}
            style={!alum.email ? { opacity: 0.45, pointerEvents: 'none' } : undefined}
          >
            Open in mail
          </a>
        </div>

        <div className="draft-foot-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select
              className="select"
              value={status}
              aria-label="Outreach status"
              onChange={(e) => onStatus(e.target.value as OutreachStatus)}
              style={{ color: STATUS_META[status].color }}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
            <button className="btn subtle" onClick={onNext} title="Move to the next alumnus in the current filter">
              Next →
            </button>
          </div>
          {!alum.email && (
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>No email on file</span>
          )}
        </div>
      </div>
    </section>
  )
}
