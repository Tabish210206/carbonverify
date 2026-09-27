'use client'
import { getDatasetInventory, getProjects } from '@/lib/data'

export default function DatasetsPage() {
  const inventory = getDatasetInventory()
  const projects = getProjects()

  return <>
    <div className="page-heading"><div><div className="eyebrow">DATASET INTELLIGENCE</div><h1>What's actually in the dataset</h1><p>An honest inventory of what is and isn't available.</p></div></div>
    <div className="metrics-grid">
      <div className="metric-card"><div className="metric-copy"><p>Projects</p><strong>{projects.length}</strong></div></div>
      <div className="metric-card"><div className="metric-copy"><p>Columns per project</p><strong>16</strong></div></div>
      <div className="metric-card"><div className="metric-copy"><p>Missing values</p><strong>0</strong></div></div>
      <div className="metric-card"><div className="metric-copy"><p>Duplicates</p><strong>0</strong></div></div>
    </div>
    <section className="projects-panel">
      <div className="panel-heading"><div><span className="eyebrow">AVAILABILITY</span><h3>Data availability</h3></div></div>
      <div className="table-wrap"><table><thead><tr><th>Field</th><th>Status</th><th>Note</th></tr></thead><tbody>
        {inventory.map(f => <tr key={f.field}><td>{f.field}</td><td><span className={`status-pill ${f.available ? 'green' : 'red'}`}><i />{f.available ? 'Available' : 'Not available'}</span></td><td>{f.note}</td></tr>)}
      </tbody></table></div>
    </section>
  </>
}
