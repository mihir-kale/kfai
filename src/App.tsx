import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Alum, EncryptedPayload, OutreachStatus, Sender } from './lib/types'
import { loadPayload, unlockDataset } from './lib/crypto'
import {
  downloadText,
  exportLogCsv,
  loadSender,
  loadStatuses,
  saveSender,
  saveStatuses,
  STATUS_META,
} from './lib/store'
import type { StatusMap } from './lib/store'
import FilterRail, { EMPTY_FILTERS } from './components/FilterRail'
import type { Facets, Filters } from './components/FilterRail'
import AlumniTable from './components/AlumniTable'
import type { Sort, SortKey } from './components/AlumniTable'
import DraftPanel from './components/DraftPanel'
import GuidePanel from './components/GuidePanel'

const PAGE_SIZE = 60
const EMPTY_FACETS: Facets = {
  years: [],
  industries: [],
  employers: [],
  types: [],
  statuses: [],
}

export default function App() {
  const [payloadState, setPayloadState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [payload, setPayload] = useState<EncryptedPayload | null>(null)
  const [records, setRecords] = useState<Alum[] | null>(null)
  const [datasetError, setDatasetError] = useState<string | null>(null)

  const [sender, setSender] = useState<Sender>(() => loadSender())
  const [statuses, setStatuses] = useState<StatusMap>(() => loadStatuses())
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<Sort>({ key: 'classYear', dir: 'desc' })
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [railOpen, setRailOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  /* ---------------------------------------------------------------- */
  /* Boot                                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false
    loadPayload().then(async (p) => {
      if (cancelled) return
      if (!p) {
        setPayloadState('missing')
        return
      }
      setPayload(p)
      setPayloadState('ready')
      const res = await unlockDataset(p, 'ubp2026')
      if (!cancelled) {
        if (res.ok) setRecords(res.records)
        else setDatasetError(res.error)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  /* ---------------------------------------------------------------- */
  /* Persistence                                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    saveSender(sender)
  }, [sender])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2000)
  }, [])

  const setStatus = useCallback(
    (id: string, status: OutreachStatus) => {
      setStatuses((prev) => {
        const next: StatusMap = {
          ...prev,
          [id]: { ...prev[id], status, updatedAt: Date.now() },
        }
        saveStatuses(next)
        return next
      })
    },
    [],
  )

  /* ---------------------------------------------------------------- */
  /* Filtering                                                         */
  /* ---------------------------------------------------------------- */

  const matches = useCallback(
    (r: Alum, f: Filters, s: StatusMap, skip?: keyof Filters): boolean => {
      if (skip !== 'q' && f.q.trim()) {
        const q = f.q.trim().toLowerCase()
        const hay = `${r.name} ${r.employer ?? ''} ${r.title ?? ''} ${r.email ?? ''} ${
          r.industry
        } ${r.classYear ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (skip !== 'years' && f.years.length && (!r.classYear || !f.years.includes(r.classYear)))
        return false
      if (skip !== 'industries' && f.industries.length && !f.industries.includes(r.industry))
        return false
      if (skip !== 'employers' && f.employers.length && !f.employers.includes(r.employerKey))
        return false
      if (skip !== 'types' && f.types.length && !f.types.includes(r.positionType)) return false
      if (skip !== 'emailOnly' && f.emailOnly && !r.email) return false
      if (skip !== 'statuses' && f.statuses.length) {
        const st = s[r.id]?.status ?? 'new'
        if (!f.statuses.includes(st)) return false
      }
      return true
    },
    [],
  )

  const filtered = useMemo(() => {
    if (!records) return []
    return records.filter((r) => matches(r, filters, statuses))
  }, [records, filters, statuses, matches])

  const facets = useMemo<Facets>(() => {
    if (!records) return EMPTY_FACETS
    const years = new Map<number, number>()
    const industries = new Map<string, number>()
    const employers = new Map<string, { label: string; count: number }>()
    const types = new Map<string, number>()
    const statusCounts = new Map<OutreachStatus, number>()

    for (const r of records) {
      if (matches(r, filters, statuses, 'years') && r.classYear) {
        years.set(r.classYear, (years.get(r.classYear) ?? 0) + 1)
      }
      if (matches(r, filters, statuses, 'industries')) {
        industries.set(r.industry, (industries.get(r.industry) ?? 0) + 1)
      }
      if (matches(r, filters, statuses, 'employers') && r.employerKey) {
        const prev = employers.get(r.employerKey)
        employers.set(r.employerKey, {
          label: prev?.label ?? r.employer ?? r.employerKey,
          count: (prev?.count ?? 0) + 1,
        })
      }
      if (matches(r, filters, statuses, 'types') && r.positionType !== 'Unknown') {
        types.set(r.positionType, (types.get(r.positionType) ?? 0) + 1)
      }
      if (matches(r, filters, statuses, 'statuses')) {
        const st = statuses[r.id]?.status ?? 'new'
        statusCounts.set(st, (statusCounts.get(st) ?? 0) + 1)
      }
    }

    return {
      years: [...years.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.value - a.value),
      industries: [...industries.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
      employers: [...employers.entries()]
        .map(([value, v]) => ({ value, label: v.label, count: v.count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, 600),
      types: [...types.entries()].map(([value, count]) => ({ value, count })),
      statuses: [...statusCounts.entries()].map(([value, count]) => ({ value, count })),
    }
  }, [records, filters, statuses, matches])

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1
    const list = [...filtered]
    list.sort((a, b) => {
      let primary = 0
      switch (sort.key) {
        case 'classYear':
          primary = (a.classYear ?? 0) - (b.classYear ?? 0)
          break
        case 'employer':
          primary = (a.employer ?? '~').localeCompare(b.employer ?? '~')
          break
        case 'industry':
          primary = a.industry.localeCompare(b.industry)
          break
        default:
          primary = a.name.localeCompare(b.name)
      }
      if (primary !== 0) return primary * dir
      return a.name.localeCompare(b.name)
    })
    return list
  }, [filtered, sort])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)

  useEffect(() => {
    setPage(0)
  }, [filters, sort])

  const pageRows = useMemo(
    () => sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [sorted, safePage],
  )

  const selected = useMemo(
    () => (records && selectedId ? records.find((r) => r.id === selectedId) ?? null : null),
    [records, selectedId],
  )

  const onSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'classYear' ? 'desc' : 'asc' },
    )
  }

  const goNext = useCallback(() => {
    if (!selected) return
    const idx = sorted.findIndex((r) => r.id === selected.id)
    const next = sorted[idx + 1]
    if (next) {
      setSelectedId(next.id)
      const targetPage = Math.floor((idx + 1) / PAGE_SIZE)
      if (targetPage !== safePage) setPage(targetPage)
    } else {
      showToast('End of this filter — nothing after this one')
    }
  }, [selected, sorted, safePage, showToast])

  /* ---------------------------------------------------------------- */
  /* Keyboard                                                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ? true : false
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && !typing && !guideOpen) {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [guideOpen])

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  if (payloadState === 'loading') {
    return (
      <div className="gate">
        <div className="gate-card">
          <div className="gate-mark">UBP</div>
          <h1>Loading dataset…</h1>
          <p>Waking up the encrypted alumni file.</p>
        </div>
      </div>
    )
  }

  if (payloadState === 'missing' || !payload) {
    return (
      <div className="gate">
        <div className="gate-card">
          <div className="gate-mark">UBP</div>
          <h1>No dataset bundled</h1>
          <p>
            The app expects an encrypted file at <code>public/dataset.enc.json</code>. Build one
            from the UBP export:
          </p>
          <pre
            style={{
              background: '#0f172a',
              color: '#e2e8f0',
              padding: '12px 14px',
              borderRadius: 8,
              fontSize: 11.5,
              overflowX: 'auto',
              lineHeight: 1.6,
            }}
          >
            npm run encrypt -- "Alumni Export.csv"
          </pre>
          <div className="gate-foot">
            The script reads any column layout, normalizes employers and industries, and writes the
            encrypted file the app loads.
          </div>
        </div>
      </div>
    )
  }

  if (!records && datasetError) {
    return (
      <div className="gate">
        <div className="gate-card">
          <div className="gate-mark">UBP</div>
          <h1>Dataset error</h1>
          <p>{datasetError}</p>
        </div>
      </div>
    )
  }

  if (!records) {
    return (
      <div className="gate">
        <div className="gate-card">
          <div className="gate-mark">UBP</div>
          <h1>Loading dataset…</h1>
          <p>Decrypting alumni records.</p>
        </div>
      </div>
    )
  }

  const contacted = records.filter((r) => {
    const st = statuses[r.id]?.status ?? 'new'
    return st === 'sent' || st === 'replied' || st === 'scheduled' || st === 'done'
  }).length
  const interviewed = records.filter((r) => statuses[r.id]?.status === 'done').length
  const logged = Object.keys(statuses).length

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">UBP</div>
          <div>
            <div className="brand-title">Alumni Outreach</div>
            <div className="brand-sub">Workstream B — Employer &amp; Industry Shift</div>
          </div>
        </div>

        <div className="topbar-spacer" />

        <div className="topbar-stats">
          <span>
            <b>{records.length.toLocaleString()}</b> alumni
          </span>
          <span>
            <b>{filtered.length.toLocaleString()}</b> in view
          </span>
          <span>
            <b>{contacted.toLocaleString()}</b> contacted
          </span>
          <span>
            <b>{interviewed.toLocaleString()}</b> interviewed
          </span>
        </div>

        <button className="ghost-btn" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
        <button className="ghost-btn" onClick={() => setGuideOpen(true)}>
          Interview guide
        </button>
      </header>

      {payload.meta.demo && (
        <div className="demo-banner">
          Demo dataset ({payload.meta.count} sample records, none of these addresses are real) —
          run <code>npm run encrypt</code> with the UBP export to replace it.
        </div>
      )}

      {railOpen && <div className="scrim rail-scrim" onClick={() => setRailOpen(false)} />}

      <div className={`workspace${selected ? ' has-draft' : ''}`}>
        <FilterRail
          filters={filters}
          onChange={setFilters}
          facets={facets}
          total={records.length}
          matched={filtered.length}
          open={railOpen}
          onClose={() => setRailOpen(false)}
          searchRef={searchRef}
        />

        <main className="main">
          <div className="toolbar">
            <button
              className="btn mobile-filters-btn"
              onClick={() => setRailOpen((v) => !v)}
            >
              Filters
            </button>
            <span className="result-count">
              <b>{sorted.length.toLocaleString()}</b> alumni
              {filters.q.trim() ? ` matching “${filters.q.trim()}”` : ''}
              {sorted.length > 0 && (
                <>
                  {' · '}
                  {safePage * PAGE_SIZE + 1}–
                  {Math.min((safePage + 1) * PAGE_SIZE, sorted.length)} shown
                </>
              )}
            </span>
            <div className="toolbar-spacer" />
            <button
              className="btn"
              disabled={logged === 0}
              onClick={() => {
                downloadText(
                  `ubp-outreach-log-${new Date().toISOString().slice(0, 10)}.csv`,
                  exportLogCsv(records, statuses),
                )
                showToast('Outreach log downloaded')
              }}
              title="Export the alumni you have contacted so the team can merge logs"
            >
              Export my log{logged ? ` (${logged})` : ''}
            </button>
          </div>

          <AlumniTable
            rows={pageRows}
            selectedId={selectedId}
            statuses={statuses}
            sort={sort}
            onSort={onSort}
            onSelect={(alum) => {
              setSelectedId(alum.id)
              setRailOpen(false)
            }}
          />

          <div className="pager">
            <span>
              {sorted.length === 0
                ? 'No results'
                : `Page ${safePage + 1} of ${pageCount} · ${sorted.length.toLocaleString()} matching`}
            </span>
            <div className="pager-btns">
              <button
                className="btn"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ← Prev
              </button>
              <button
                className="btn"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Next →
              </button>
            </div>
          </div>
        </main>

        {selected && (
          <DraftPanel
            alum={selected}
            sender={sender}
            onSenderChange={setSender}
            statusEntry={statuses[selected.id]}
            onStatus={(status) => setStatus(selected.id, status)}
            onClose={() => setSelectedId(null)}
            onNext={goNext}
            onToast={showToast}
            onOpenGuide={() => setGuideOpen(true)}
          />
        )}
      </div>

      <GuidePanel
        open={guideOpen}
        alum={selected}
        onClose={() => setGuideOpen(false)}
        onToast={showToast}
      />

      {toast && <div className="toast">{toast}</div>}

      <span className="sr-only" aria-live="polite">
        {filtered.length} alumni match the current filters. Status of selected alumnus:{' '}
        {selected ? STATUS_META[statuses[selected.id]?.status ?? 'new'].label : 'none selected'}.
      </span>
    </div>
  )
}
