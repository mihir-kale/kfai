import type { Alum, OutreachStatus, Sender, StatusEntry } from './types'

const NS = 'ubp-outreach:v1'
const SENDER_KEY = `${NS}:sender`
const STATUS_KEY = `${NS}:status`
const DRAFT_KEY = `${NS}:draft`

export const DEFAULT_SENDER: Sender = {
  name: '',
  email: '',
  classYear: '',
  org: 'Undergraduate Business Program',
  link: '',
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or private mode — drafts still work for this session */
  }
}

export function loadSender(): Sender {
  return { ...DEFAULT_SENDER, ...readJSON<Partial<Sender>>(SENDER_KEY, {}) }
}

export function saveSender(sender: Sender) {
  writeJSON(SENDER_KEY, sender)
}

export type StatusMap = Record<string, StatusEntry>

export function loadStatuses(): StatusMap {
  return readJSON<StatusMap>(STATUS_KEY, {})
}

export function saveStatuses(map: StatusMap) {
  writeJSON(STATUS_KEY, map)
}

export type DraftMap = Record<string, { subject: string; body: string }>

export function draftKey(alumId: string, template: string, variant: number): string {
  return `${alumId}|${template}|${variant}`
}

export function loadDrafts(): DraftMap {
  return readJSON<DraftMap>(DRAFT_KEY, {})
}

export function saveDrafts(map: DraftMap) {
  writeJSON(DRAFT_KEY, map)
}

export const STATUS_META: Record<
  OutreachStatus,
  { label: string; color: string; bg: string }
> = {
  new: { label: 'Not contacted', color: '#64748b', bg: '#f1f5f9' },
  queued: { label: 'Drafted', color: '#92400e', bg: '#fef3c7' },
  sent: { label: 'Sent', color: '#1d4ed8', bg: '#dbeafe' },
  replied: { label: 'Replied', color: '#6d28d9', bg: '#ede9fe' },
  scheduled: { label: 'Scheduled', color: '#0f766e', bg: '#ccfbf1' },
  done: { label: 'Interviewed', color: '#166534', bg: '#dcfce7' },
  skip: { label: 'Not a fit', color: '#9f1239', bg: '#ffe4e6' },
}

export const STATUS_ORDER: OutreachStatus[] = [
  'new',
  'queued',
  'sent',
  'replied',
  'scheduled',
  'done',
  'skip',
]

function csvCell(value: string): string {
  const s = value ?? ''
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Outreach log for the team to merge — no message bodies, just who was contacted. */
export function exportLogCsv(records: Alum[], statuses: StatusMap): string {
  const header = ['name', 'email', 'employer', 'title', 'class_year', 'industry', 'status', 'updated']
  const rows = records
    .filter((r) => statuses[r.id])
    .map((r) => {
      const entry = statuses[r.id]
      return [
        r.name,
        r.email || '',
        r.employer || '',
        r.title || '',
        r.classYear ? String(r.classYear) : '',
        r.industry,
        entry.status,
        new Date(entry.updatedAt).toISOString().slice(0, 10),
      ].map(csvCell)
    })
  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function downloadText(filename: string, text: string, mime = 'text/csv') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}
