'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getProjects } from '@/lib/data'
import { StatusPill } from '@/components/ui-bits'

type SortKey = 'id' | 'areaHa' | 'dataQuality'

export default function ProjectsPage() {
  const { setSelectedProjectId } = useApp()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [filterQuality, setFilterQuality] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All')

  const projects = useMemo(() => {
    let list = getProjects().filter(p => p.id.includes(query) || p.claim.toLowerCase().includes(query.toLowerCase()))
    if (filterQuality !== 'All') list = list.filter(p => p.dataQuality === filterQuality)
    return [...list].sort((a, b) => (sortKey === 'id' ? a.id.localeCompare(b.id) : sortKey === 'areaHa' ? b.areaHa - a.areaHa : a.dataQuality.localeCompare(b.dataQuality)))
  }, [query, sortKey, filterQuality])

  function open(id: string) {
    setSelectedProjectId(id)
    router.push(`/projects/${id}`)
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow">PROJECT EXPLORER</div><h1>All monitored projects</h1><p>Search, sort, and filter every project in the evaluation set.</p></div></div>
    <section className="projects-panel">
      <div className="panel-heading">
        <div className="table-search"><Search size={14} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by ID or claim type" /></div>
        <div className="table-actions">
          <select value={filterQuality} onChange={e => setFilterQuality(e.target.value as any)}>
            <option value="All">All data quality</option><option value="High">High</option><option value="Moderate">Moderate</option><option value="Low">Low</option>
          </select>
          <button className="button ghost" onClick={() => setSortKey(k => k === 'id' ? 'areaHa' : k === 'areaHa' ? 'dataQuality' : 'id')}><ArrowUpDown size={14} />Sort: {sortKey}</button>
        </div>
      </div>
      <div className="table-wrap"><table><thead><tr>
        <th>Project</th><th>Area</th><th>Source</th><th>Period</th><th>NDVI Before</th><th>NDVI After</th><th>NDVI Δ</th><th>Improved</th><th>Declined</th><th>Quality</th><th>Assessment</th>
      </tr></thead><tbody>
        {projects.map(p => <tr key={p.id} onClick={() => open(p.id)}>
          <td><strong>Project {p.id}</strong><small>{p.claim}</small></td>
          <td>{p.area}</td>
          <td>{p.source}</td>
          <td>{p.periodBefore.slice(0, 7)} → {p.periodAfter.slice(0, 7)}</td>
          <td>{p.ndviBefore}</td><td>{p.ndviAfter}</td>
          <td className={p.ndviAfter - p.ndviBefore < 0 ? 'red-text' : 'green-text'}>{(p.ndviAfter - p.ndviBefore).toFixed(3)}</td>
          <td>{p.improvedPct}%</td><td>{p.declinedPct}%</td>
          <td><span className="quality-dot"><i />{p.dataQuality}</span></td>
          <td><StatusPill tone={p.tone}>{p.status}</StatusPill></td>
        </tr>)}
        {projects.length === 0 && <tr><td colSpan={11} className="empty-row">No projects match this filter.</td></tr>}
      </tbody></table></div>
    </section>
  </>
}
