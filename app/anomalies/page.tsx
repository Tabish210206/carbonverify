'use client'
import { useApp } from '@/context/AppContext'
import { getAnomalies, getProject } from '@/lib/data'
import { Gauge, HowCalculated, StatusPill } from '@/components/ui-bits'

export default function AnomaliesPage() {
  const { selectedProjectId } = useApp()
  const p = getProject(selectedProjectId)
  const anomaly = getAnomalies(selectedProjectId)

  return <>
    <div className="page-heading"><div><div className="eyebrow">ANOMALY INTELLIGENCE</div><h1>Prototype anomaly screening</h1><p>Project {p.id}</p></div>
      <StatusPill tone={anomaly.severity === 'High' ? 'red' : anomaly.severity === 'Moderate' ? 'amber' : 'green'}>{anomaly.status}</StatusPill>
    </div>
    <div className="notice"><div className="notice-icon">i</div><div><strong>PROTOTYPE ANOMALY SCREENING — not a trained Isolation Forest</strong><span>No Python/scikit-learn execution environment is available here to fit a real Isolation Forest. This score is a transparent, deterministic rule over the same delta features an Isolation Forest would use.</span></div></div>
    <div className="hero-grid">
      <section className="panel">
        <div className="panel-heading"><div><span className="eyebrow">SCORE</span><h3>Anomaly score</h3></div>
          <HowCalculated title="Anomaly score — how calculated">
            <p>Score = min(100, round(900 × Σ|Δindex|)) summed across NDVI, SAVI, EVI, and NDMI deltas. Severity thresholds: High &gt; 60, Moderate &gt; 30, otherwise Low.</p>
          </HowCalculated>
        </div>
        <Gauge value={anomaly.score} label={`${anomaly.severity} severity`} />
      </section>
      <section className="panel">
        <div className="panel-heading"><div><span className="eyebrow">CONTRIBUTING FEATURES</span><h3>Ranked by contribution</h3></div></div>
        <div className="table-wrap"><table><thead><tr><th>Feature</th><th>Contribution</th></tr></thead><tbody>
          {anomaly.contributing.map(c => <tr key={c.feature}><td>{c.feature}</td><td>{c.contribution}</td></tr>)}
        </tbody></table></div>
      </section>
    </div>
  </>
}
