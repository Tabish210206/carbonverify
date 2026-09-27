'use client'
import { useApp } from '@/context/AppContext'
import { getConfidence, getProject } from '@/lib/data'
import { Gauge, HowCalculated, RadarChart } from '@/components/ui-bits'

export default function ConfidencePage() {
  const { selectedProjectId } = useApp()
  const p = getProject(selectedProjectId)
  const confidence = getConfidence(selectedProjectId)

  return <>
    <div className="page-heading"><div><div className="eyebrow">EVIDENCE CONFIDENCE</div><h1>How confident is this assessment?</h1><p>Project {p.id}</p></div></div>
    <div className="hero-grid">
      <section className="panel">
        <div className="panel-heading"><div><span className="eyebrow">OVERALL</span><h3>Confidence gauge</h3></div>
          <HowCalculated title="Confidence — how calculated">
            <p>Overall confidence is the mean of six components: Spatial Evidence, Temporal Evidence, Vegetation Evidence, Stability, Data Quality (from the claim comparison), plus Model Confidence (100 minus the anomaly score).</p>
          </HowCalculated>
        </div>
        <Gauge value={confidence.overall} label={confidence.overall >= 65 ? 'High confidence' : confidence.overall >= 45 ? 'Moderate confidence' : 'Low confidence'} />
      </section>
      <section className="panel">
        <div className="panel-heading"><div><span className="eyebrow">RADAR</span><h3>Component breakdown</h3></div></div>
        <RadarChart points={confidence.components.map(c => ({ label: c.label, value: c.score }))} />
      </section>
    </div>
    <section className="projects-panel">
      <div className="table-wrap"><table><thead><tr><th>Component</th><th>Score</th></tr></thead><tbody>
        {confidence.components.map(c => <tr key={c.label}><td>{c.label}</td><td>{c.score}/100</td></tr>)}
      </tbody></table></div>
    </section>
  </>
}
