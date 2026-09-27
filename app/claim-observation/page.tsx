'use client'
import { useApp } from '@/context/AppContext'
import { getClaimComparison, getProject } from '@/lib/data'
import { HowCalculated } from '@/components/ui-bits'

export default function ClaimObservationPage() {
  const { selectedProjectId } = useApp()
  const p = getProject(selectedProjectId)
  const claim = getClaimComparison(selectedProjectId)

  return <>
    <div className="page-heading"><div><div className="eyebrow">03 / CLAIM VS OBSERVATION</div><h1>Consistency review</h1><p>Project {p.id}</p></div></div>
    <section className="panel claim-panel">
      <div className="panel-heading"><div><span className="eyebrow">COMPARISON</span><h3>Claim vs. observed evidence</h3></div></div>
      <div className="claim-row">
        <div><span>PROJECT CLAIM</span><strong>{p.claim}</strong><small>Claim dimension provided for assessment</small></div>
        <div className="versus">VS</div>
        <div><span>OBSERVED EVIDENCE</span><strong className={p.improvedPct >= p.declinedPct ? 'green-text' : 'red-text'}>{p.improvedPct >= p.declinedPct ? 'Vegetation improvement observed' : 'Vegetation decline observed'}</strong><small>NDVI delta {(p.ndviAfter - p.ndviBefore).toFixed(3)} · {p.declinedPct}% declined</small></div>
      </div>
      <div className="consistency">
        <div><span>CONSISTENCY SCORE</span><strong>{claim.consistencyScore}<span>/100</span></strong></div>
        <div className="consistency-track"><i style={{ width: `${claim.consistencyScore}%` }} /></div>
        <small>{claim.verdict}. Analytical comparison only. Not formal certification.</small>
        <HowCalculated title="Analytical consistency score — how calculated">
          <p>The score averages five 0–100 components: Spatial Evidence, Temporal Evidence, Vegetation Evidence, Stability, and Data Quality.</p>
          <ul>{claim.components.map(c => <li key={c.label}><strong>{c.label}: {c.score}</strong> — {c.note}</li>)}</ul>
        </HowCalculated>
      </div>
    </section>
    <section className="projects-panel">
      <div className="panel-heading"><div><span className="eyebrow">BREAKDOWN</span><h3>Evidence components</h3></div></div>
      <div className="table-wrap"><table><thead><tr><th>Component</th><th>Score</th><th>Note</th></tr></thead><tbody>
        {claim.components.map(c => <tr key={c.label}><td><strong>{c.label}</strong></td><td>{c.score}/100</td><td>{c.note}</td></tr>)}
      </tbody></table></div>
    </section>
  </>
}
