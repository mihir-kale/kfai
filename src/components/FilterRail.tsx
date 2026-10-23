import { useMemo, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { OutreachStatus } from '../lib/types'
import { STATUS_META, STATUS_ORDER } from '../lib/store'

export type Filters = {
  q: string
  years: number[]
  industries: string[]
  employers: string[]
  types: string[]
  statuses: OutreachStatus[]
  emailOnly: boolean
}

export const EMPTY_FILTERS: Filters = {
  q: '',
  years: [],
  industries: [],
  employers: [],
  types: [],
  statuses: [],
  emailOnly: false,
}

export type Facets = {
  years: { value: number; count: number }[]
  industries: { value: string; count: number }[]
  employers: { value: string; label: string; count: number }[]
  types: { value: string; count: number }[]
  statuses: { value: OutreachStatus; count: number }[]
}

type Props = {
  filters: Filters
  onChange: (next: Filters) => void
  facets: Facets
  total: number
  matched: number
  open: boolean
  onClose: () => void
  searchRef: RefObject<HTMLInputElement>
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function Group({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: ReactNode
}) {
  return (
    <div className="filter-group">
      <div className="group-head">
        <span>{title}</span>
        {typeof count === 'number' && <span className="count">{count}</span>}
      </div>
      {children}
    </div>
  )
}

function Row({
  checked,
  label,
  count,
  onChange,
}: {
  checked: boolean
  label: string
  count?: number
  onChange: () => void
}) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="label" title={label}>
        {label}
      </span>
      {typeof count === 'number' && <span className="n">{count}</span>}
    </label>
  )
}

export default function FilterRail({
  filters,
  onChange,
  facets,
  total,
  matched,
  open,
  onClose,
  searchRef,
}: Props) {
  const [employerQuery, setEmployerQuery] = useState('')

  const visibleEmployers = useMemo(() => {
    const q = employerQuery.trim().toLowerCase()
    const list = q
      ? facets.employers.filter((e) => e.label.toLowerCase().includes(q))
      : facets.employers
    return list.slice(0, 120)
  }, [facets.employers, employerQuery])

  const activeCount =
    filters.years.length +
    filters.industries.length +
    filters.employers.length +
    filters.types.length +
    filters.statuses.length +
    (filters.emailOnly ? 1 : 0) +
    (filters.q.trim() ? 1 : 0)

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <aside className={`rail${open ? ' open' : ''}`} aria-label="Filters">
      <div className="rail-head">
        <span className="rail-title">Filters</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {activeCount > 0 && (
            <button className="link-btn" onClick={() => onChange(EMPTY_FILTERS)}>
              Clear {activeCount}
            </button>
          )}
          <button className="link-btn muted rail-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="search-box">
        <span className="search-icon">⌕</span>
        <input
          ref={searchRef}
          type="search"
          value={filters.q}
          placeholder="Name, employer, title, email…"
          aria-label="Search alumni"
          onChange={(e) => set({ q: e.target.value })}
        />
      </div>

      <div className="switch-row">
        <span>Only records with an email</span>
        <button
          type="button"
          className="switch"
          aria-pressed={filters.emailOnly}
          aria-label="Only records with an email"
          onClick={() => set({ emailOnly: !filters.emailOnly })}
        />
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--muted)', padding: '6px 2px 2px' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{matched.toLocaleString()}</b> of{' '}
        {total.toLocaleString()}
      </div>

      <Group title="Industry" count={filters.industries.length || undefined}>
        {facets.industries.length === 0 && <div className="rail-empty">No matches</div>}
        {facets.industries.map((f) => (
          <Row
            key={f.value}
            checked={filters.industries.includes(f.value)}
            label={f.value}
            count={f.count}
            onChange={() => set({ industries: toggle(filters.industries, f.value) })}
          />
        ))}
      </Group>

      <Group title="Class year" count={filters.years.length || undefined}>
        <div className="scroll-list">
          {facets.years.map((f) => (
            <Row
              key={f.value}
              checked={filters.years.includes(f.value)}
              label={String(f.value)}
              count={f.count}
              onChange={() => set({ years: toggle(filters.years, f.value) })}
            />
          ))}
        </div>
      </Group>

      <Group title="Employer" count={filters.employers.length || undefined}>
        <div className="search-box" style={{ marginBottom: 6 }}>
          <input
            value={employerQuery}
            placeholder="Find an employer…"
            aria-label="Filter employer list"
            onChange={(e) => setEmployerQuery(e.target.value)}
            style={{ paddingLeft: 10 }}
          />
        </div>
        <div className="scroll-list tall">
          {visibleEmployers.length === 0 && <div className="rail-empty">No matches</div>}
          {visibleEmployers.map((f) => (
            <Row
              key={f.value}
              checked={filters.employers.includes(f.value)}
              label={f.label}
              count={f.count}
              onChange={() => set({ employers: toggle(filters.employers, f.value) })}
            />
          ))}
          {facets.employers.length > visibleEmployers.length && employerQuery === '' && (
            <div className="rail-empty">
              {facets.employers.length - visibleEmployers.length} more — search to narrow
            </div>
          )}
        </div>
      </Group>

      <Group title="Position" count={filters.types.length || undefined}>
        <div className="pill-toggle" style={{ marginBottom: 8 }}>
          {['Full-time', 'Intern'].map((t) => {
            const n = facets.types.find((f) => f.value === t)?.count
            return (
              <button
                key={t}
                type="button"
                aria-pressed={filters.types.includes(t)}
                onClick={() => set({ types: toggle(filters.types, t) })}
              >
                {t}
                {typeof n === 'number' ? ` ${n}` : ''}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="My outreach" count={filters.statuses.length || undefined}>
        {STATUS_ORDER.map((s) => {
          const facet = facets.statuses.find((f) => f.value === s)
          return (
            <Row
              key={s}
              checked={filters.statuses.includes(s)}
              label={STATUS_META[s].label}
              count={facet?.count ?? 0}
              onChange={() => set({ statuses: toggle(filters.statuses, s) })}
            />
          )
        })}
      </Group>
    </aside>
  )
}
