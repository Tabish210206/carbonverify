'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Activity, AlertTriangle, Bot, FileText, Radar, ScanSearch, Satellite, ShieldCheck, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getAnomalies, getClaimComparison, getConfidence, getProject } from '@/lib/data'
import { StatusPill } from '@/components/ui-bits'
import EvidenceSlider from '@/components/EvidenceSlider'

const SECTIONS = [
  { label: 'Satellite Evidence', href: '/satellite', icon: Satellite },
  { label: 'Spectral Intelligence', href: '/spectral', icon: Radar },
  { label: 'Change Detection', href: '/change', icon: ScanSearch },
  { label: 'Anomaly Intelligence', href: '/anomalies', icon: AlertTriangle },
  { label: 'Claim vs Observation', href: '/claim-observation', icon: ShieldCheck },
  { label: 'Confidence', href: '/confidence', icon: Activity },
  { label: 'Explainable AI', href: '/xai', icon: Sparkles },
  { label: 'AI Copilot', href: '/copilot', icon: Bot },
  { label: 'Report', href: '/reports', icon: FileText },
]

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { setSelectedProjectId, logAction } = useApp()
  const p = getProject(id)
  const claim = getClaimComparison(id)
  const anomaly = getAnomalies(id)
  const confidence = getConfidence(id)

  useEffect(() => {
    setSelectedProjectId(id)
    logAction(`Project intelligence opened: ${id}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">PROJECT INTELLIGENCE</div><h1>Project {p.id}</h1><p>{p.claim} · {p.area} · {p.source}</p></div>
      <div className="heading-actions"><StatusPill tone={p.tone}>{p.status}</StatusPill></div>
    </div>
    <div className="metrics-grid">
      <div className="metric-card"><div className="metric-copy"><p>Area</p><strong>{p.area}</strong></div></div>
      <div className="metric-card"><div className="metric-copy"><p>Observation period</p><strong style={{ fontSize: 13 }}>{p.periodBefore} → {p.periodAfter}</strong></div></div>
      <div className="metric-card"><div className="metric-copy"><p>Data source</p><strong style={{ fontSize: 13 }}>{p.source}</strong></div></div>
      <div className="metric-card"><div className="metric-copy"><p>Data quality</p><strong>{p.dataQuality}</strong></div></div>
    </div>
    <div className="hero-grid">
      <div className="evidence-card">
        <div className="card-header"><div><strong>Before / after comparison</strong><span>Project {p.id} · vegetation signal</span></div><StatusPill tone="cyan">Interactive</StatusPill></div>
        <EvidenceSlider projectId={p.id} periodBefore={p.periodBefore} periodAfter={p.periodAfter} />
        <div className="evidence-footer">
          <div><span>NDVI BEFORE</span><strong>{p.ndviBefore}</strong></div>
          <div className="change"><span>DELTA</span><strong>{(p.ndviAfter - p.ndviBefore).toFixed(3)}</strong></div>
          <div><span>NDVI AFTER</span><strong>{p.ndviAfter}</strong></div>
          <div className="quality"><span>DATA QUALITY</span><strong><i /> {p.dataQuality}</strong></div>
        </div>
      </div>
      <aside className="intel-card">
        <div className="card-header"><div><strong>Project intelligence</strong><span>Evidence synthesis</span></div><ShieldCheck className="cyan-text" size={18} /></div>
        <div className="intel-score"><div className="score-ring"><div><strong>{confidence.overall}</strong><span>/ 100</span></div></div><div><span>ANALYTICAL CONFIDENCE</span><strong>{confidence.overall >= 65 ? 'High' : confidence.overall >= 45 ? 'Moderate' : 'Low'}</strong><small>{confidence.overall < 65 ? 'Human review recommended' : 'Evidence broadly consistent'}</small></div></div>
        <div className="intel-list">
          <div><span>Improved pixels</span><strong className="green-text">{p.improvedPct}%</strong></div>
          <div><span>Declined pixels</span><strong className="red-text">{p.declinedPct}%</strong></div>
          <div><span>Stable pixels</span><strong>{p.stablePct}%</strong></div>
          <div><span>Anomaly severity</span><strong>{anomaly.severity}</strong></div>
        </div>
        <div className="assessment"><span>ASSESSMENT</span><strong><i /> {claim.verdict}</strong><p>Consistency score {claim.consistencyScore}/100.</p></div>
      </aside>
    </div>
    <section className="projects-panel">
      <div className="panel-heading"><div><span className="eyebrow">DEEP DIVE</span><h3>Explore this project</h3></div></div>
      <div className="section-links">
        {SECTIONS.map(s => <Link key={s.href} href={s.href} className="section-link"><s.icon size={16} /><span>{s.label}</span></Link>)}
      </div>
    </section>
  </>
}
