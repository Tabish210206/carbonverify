'use client'
import { useApp } from '@/context/AppContext'
import { getChangeStatistics, getProject } from '@/lib/data'
import { BarRow } from '@/components/ui-bits'

export default function ChangePage() {
  const { selectedProjectId } = useApp()
  const p = getProject(selectedProjectId)
  const stats = getChangeStatistics(selectedProjectId)
  const maxMag = Math.max(...stats.map(s => Math.abs(s.delta)), 0.001)

  return <>
    <div className="page-heading"><div><div className="eyebrow">02 / CHANGE INTELLIGENCE</div><h1>What changed?</h1><p>Project {p.id} · AFTER − BEFORE across all four indices.</p></div></div>
    <section className="panel">
      <div className="bars">
        {stats.map(s => <BarRow key={s.key} label={s.label} value={`${s.delta >= 0 ? '+' : ''}${s.delta}`} pct={(Math.abs(s.delta) / maxMag) * 100} positive={s.delta >= 0} />)}
      </div>
      <div className="change-legend"><span><i className="red" />Declined {p.declinedPct}%</span><span><i className="green" />Improved {p.improvedPct}%</span><span><i className="gray" />Stable {p.stablePct}%</span></div>
    </section>
    <section className="projects-panel">
      <div className="panel-heading"><div><span className="eyebrow">CLASSIFICATION</span><h3>Per-index classification</h3></div></div>
      <div className="table-wrap"><table><thead><tr><th>Index</th><th>Delta</th><th>Classification</th></tr></thead><tbody>
        {stats.map(s => <tr key={s.key}><td><strong>{s.label}</strong></td><td className={s.delta < 0 ? 'red-text' : 'green-text'}>{s.delta >= 0 ? '+' : ''}{s.delta}</td>
          <td><span className={`status-pill ${s.classification === 'Improved' ? 'green' : s.classification === 'Declined' ? 'red' : 'amber'}`}><i />{s.classification}</span></td></tr>)}
      </tbody></table></div>
    </section>
  </>
}
