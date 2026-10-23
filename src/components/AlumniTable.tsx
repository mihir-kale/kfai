import type { Alum, StatusEntry } from '../lib/types'
import { STATUS_META } from '../lib/store'
import { REALM_TINT } from '../lib/ui'

export type SortKey = 'name' | 'classYear' | 'employer' | 'industry'
export type Sort = { key: SortKey; dir: 'asc' | 'desc' }

type Props = {
  rows: Alum[]
  selectedId: string | null
  statuses: Record<string, StatusEntry>
  sort: Sort
  onSort: (key: SortKey) => void
  onSelect: (alum: Alum) => void
}

function SortHeader({
  label,
  k,
  sort,
  onSort,
  className,
}: {
  label: string
  k: SortKey
  sort: Sort
  onSort: (key: SortKey) => void
  className?: string
}) {
  const active = sort.key === k
  return (
    <th
      className={`sortable${className ? ` ${className}` : ''}`}
      onClick={() => onSort(k)}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      {active && <span className="arrow">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )
}

export default function AlumniTable({
  rows,
  selectedId,
  statuses,
  sort,
  onSort,
  onSelect,
}: Props) {
  return (
    <div className="table-wrap">
      <table className="alumni">
        <thead>
          <tr>
            <SortHeader label="Alumnus" k="name" sort={sort} onSort={onSort} />
            <SortHeader label="Class" k="classYear" sort={sort} onSort={onSort} />
            <SortHeader label="Employer" k="employer" sort={sort} onSort={onSort} />
            <th>Title</th>
            <SortHeader label="Industry" k="industry" sort={sort} onSort={onSort} />
            <th>Outreach</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const entry = statuses[r.id]
            const status = entry?.status ?? 'new'
            const meta = STATUS_META[status]
            const tint = REALM_TINT[r.realm] ?? REALM_TINT.other
            const selected = r.id === selectedId
            return (
              <tr
                key={r.id}
                className={selected ? 'selected' : undefined}
                onClick={() => onSelect(r)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(r)
                  }
                }}
              >
                <td>
                  <div className="cell-name">{r.name}</div>
                  <div className="cell-email" title={r.email ?? ''}>
                    {r.email || '— no email on file'}
                  </div>
                </td>
                <td className="cell-muted">{r.classYear ?? '—'}</td>
                <td>
                  <div className="cell-trunc" title={r.employer ?? ''}>
                    {r.employer || <span className="cell-muted">—</span>}
                  </div>
                </td>
                <td>
                  <div className="cell-trunc" title={r.title ?? ''}>
                    {r.title || <span className="cell-muted">—</span>}
                  </div>
                </td>
                <td>
                  <span className="chip" style={{ background: tint.bg, color: tint.fg }}>
                    {r.industry}
                  </span>
                </td>
                <td className="status-cell">
                  <span className="chip" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="row-action"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(r)
                    }}
                  >
                    Draft →
                  </button>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">
                  <h3>No alumni match these filters</h3>
                  <p>Try clearing a filter or broadening the search.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
