'use client'
import { useApp } from '@/context/AppContext'
import { getProject } from '@/lib/data'
import { StatusPill } from '@/components/ui-bits'
import EvidenceSlider from '@/components/EvidenceSlider'

export default function SatellitePage() {
  const { selectedProjectId } = useApp()
  const p = getProject(selectedProjectId)
  return <>
    <div className="page-heading"><div><div className="eyebrow">01 / SATELLITE EVIDENCE</div><h1>Read the landscape, not the claim.</h1><p>Project {p.id} · {p.source} · {p.periodBefore} → {p.periodAfter}</p></div></div>
    <div className="hero-grid" style={{ gridTemplateColumns: '1fr' }}>
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
    </div>
    <div className="notice"><div className="notice-icon">i</div><div><strong>Illustrative Evidence Viewer</strong><span>No raw satellite band imagery was included in the supplied dataset. This viewer renders a labeled, interactive stand-in with a real drag/slider mechanism, ready to swap in real Sentinel-2 tiles when available.</span></div></div>
  </>
}
