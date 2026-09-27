'use client'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Layers3, Leaf, Sprout } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getProjects } from '@/lib/data'
import { Metric, StatusPill } from '@/components/ui-bits'

export default function OverviewPage() {
  const { setSelectedProjectId } = useApp()
  const router = useRouter()
  const projects = getProjects()
  const totalArea = projects.reduce((a, p) => a + p.areaHa, 0)
  const avgDelta = projects.reduce((a, p) => a + (p.ndviAfter - p.ndviBefore), 0) / projects.length
  const needsReview = projects.filter(p => p.tone !== 'green').length
  const pixelsAnalyzed = Math.round(totalArea * 111) // illustrative order-of-magnitude only (10m Sentinel-2 pixels)

  function openProject(id: string) {
    setSelectedProjectId(id)
    router.push(`/projects/${id}`)
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" />ANALYTICAL OVERVIEW</div><h1>Evidence overview</h1><p>Independent environmental intelligence for carbon project claims.</p></div></div>
    <div className="notice"><div className="notice-icon"><AlertTriangle size={17} /></div><div><strong>Evidence pipeline is a research prototype</strong><span>Project-level Sentinel-2 summary data · 7 projects available · Ground truth labels not included</span></div></div>
    <div className="metrics-grid">
      <Metric label="Projects analyzed" value={String(projects.length).padStart(2, '0')} detail={`of ${projects.length} available`} icon={Layers3} />
      <Metric label="Total area" value={`${totalArea.toLocaleString()} ha`} detail="across all projects" icon={Sprout} tone="green" />
      <Metric label="Pixels analyzed (est.)" value={pixelsAnalyzed.toLocaleString()} detail="illustrative, 10m resolution" icon={Layers3} tone="cyan" />
      <Metric label="Avg. NDVI change" value={avgDelta.toFixed(3)} detail="vs. prior period" icon={Leaf} tone={avgDelta >= 0 ? 'green' : 'amber'} />
      <Metric label="Needs review" value={String(needsReview).padStart(2, '0')} detail="evidence divergence or review" icon={AlertTriangle} tone="red" />
    </div>
    <section className="projects-panel">
      <div className="panel-heading"><div><span className="eyebrow">PROJECT COMPARISON</span><h3>All monitored projects</h3></div></div>
      <div className="table-wrap"><table><thead><tr><th>Project</th><th>Area</th><th>NDVI Δ</th><th>Improved</th><th>Declined</th><th>Quality</th><th>Assessment</th></tr></thead><tbody>
        {projects.map(p => <tr key={p.id} onClick={() => openProject(p.id)}>
          <td><strong>Project {p.id}</strong><small>{p.source}</small></td>
          <td>{p.area}</td>
          <td className={p.ndviAfter - p.ndviBefore < 0 ? 'red-text' : 'green-text'}>{(p.ndviAfter - p.ndviBefore).toFixed(3)}</td>
          <td>{p.improvedPct}%</td>
          <td>{p.declinedPct}%</td>
          <td><span className="quality-dot"><i />{p.dataQuality}</span></td>
          <td><StatusPill tone={p.tone}>{p.status}</StatusPill></td>
        </tr>)}
      </tbody></table></div>
    </section>
  </>
}
