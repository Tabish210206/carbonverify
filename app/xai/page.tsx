'use client'
import { useApp } from '@/context/AppContext'
import { getProject, getXai } from '@/lib/data'
import { BarRow } from '@/components/ui-bits'

export default function XaiPage() {
  const { selectedProjectId } = useApp()
  const p = getProject(selectedProjectId)
  const xai = getXai(selectedProjectId)

  return <>
    <div className="page-heading"><div><div className="eyebrow">EXPLAINABLE AI</div><h1>Analytical feature contribution</h1><p>Project {p.id}</p></div></div>
    <div className="notice"><div className="notice-icon">i</div><div><strong>Not SHAP</strong><span>No trained model or SHAP explainer runs in this environment. Contributions below rank the same observed index deltas by magnitude and direction, so the explanation stays evidence-grounded rather than invented.</span></div></div>
    <section className="panel">
      <div className="bars">
        {xai.map(x => <BarRow key={x.feature} label={x.feature} value={`${x.contribution}%`} pct={x.contribution} positive={x.direction === 'positive'} />)}
      </div>
    </section>
    <section className="projects-panel">
      <div className="table-wrap"><table><thead><tr><th>Feature</th><th>Contribution</th><th>Direction</th><th>Importance</th></tr></thead><tbody>
        {xai.map(x => <tr key={x.feature}><td><strong>{x.feature}</strong></td><td>{x.contribution}%</td>
          <td className={x.direction === 'positive' ? 'green-text' : 'red-text'}>{x.direction}</td><td>{x.importance}</td></tr>)}
      </tbody></table></div>
    </section>
  </>
}
