'use client'
import { useState } from 'react'
import { CircleHelp, X } from 'lucide-react'

export function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`status-pill ${tone}`}><i />{children}</span>
}

export function Metric({ label, value, detail, icon: Icon, tone = 'cyan' }: { label: string; value: string; detail: string; icon: any; tone?: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={16} /></div><div className="metric-copy"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></div>
}

export function HowCalculated({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <>
    <button className="how-calculated-btn" onClick={() => setOpen(true)}><CircleHelp size={13} />How calculated?</button>
    {open && <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><strong>{title}</strong><button onClick={() => setOpen(false)}><X size={16} /></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>}
  </>
}

export function BarRow({ label, value, pct, positive }: { label: string; value: string; pct: number; positive: boolean }) {
  return <>
    <div className="bar-label"><span>{label}</span><em>{value}</em></div>
    <div className="bar-track"><i className={positive ? 'positive' : ''} style={{ width: `${Math.min(100, Math.max(4, pct))}%` }} /></div>
  </>
}

export function Gauge({ value, label }: { value: number; label: string }) {
  const angle = (value / 100) * 180
  return <div className="gauge">
    <svg viewBox="0 0 120 70">
      <path d="M10,65 A50,50 0 0 1 110,65" fill="none" stroke="var(--line)" strokeWidth="10" />
      <path d="M10,65 A50,50 0 0 1 110,65" fill="none" stroke={value > 65 ? 'var(--green)' : value > 40 ? 'var(--amber)' : 'var(--red)'} strokeWidth="10"
        strokeDasharray={`${(angle / 180) * 157} 157`} />
    </svg>
    <div className="gauge-value"><strong>{value}</strong><span>/ 100</span></div>
    <small>{label}</small>
  </div>
}

export function RadarChart({ points }: { points: { label: string; value: number }[] }) {
  const n = points.length
  const cx = 100, cy = 100, r = 78
  const coords = points.map((p, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const rad = (p.value / 100) * r
    return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)]
  })
  const axisCoords = points.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })
  const poly = coords.map(c => c.join(',')).join(' ')
  return <svg viewBox="0 0 200 220" className="radar-chart">
    {[0.33, 0.66, 1].map(f => <polygon key={f} points={axisCoords.map((_, i) => { const angle = (Math.PI * 2 * i) / n - Math.PI / 2; return `${cx + r * f * Math.cos(angle)},${cy + r * f * Math.sin(angle)}` }).join(' ')} fill="none" stroke="var(--line)" />)}
    {axisCoords.map((c, i) => <line key={i} x1={cx} y1={cy} x2={c[0]} y2={c[1]} stroke="var(--line)" />)}
    <polygon points={poly} fill="rgba(107,217,223,0.22)" stroke="var(--cyan)" strokeWidth="2" />
    {points.map((p, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const lx = cx + (r + 22) * Math.cos(angle), ly = cy + (r + 22) * Math.sin(angle)
      return <text key={p.label} x={lx} y={ly} textAnchor="middle" fontSize="9" fill="var(--muted)">{p.label}</text>
    })}
  </svg>
}
