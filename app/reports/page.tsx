'use client'
import { useState } from 'react'
import { Download, FileText, Printer } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getAnomalies, getClaimComparison, getConfidence, getProject, getProjectIndices, getXai } from '@/lib/data'

export default function ReportsPage() {
  const { selectedProjectId, logAction } = useApp()
  const [generated, setGenerated] = useState(false)
  const p = getProject(selectedProjectId)
  const idx = getProjectIndices(selectedProjectId)
  const claim = getClaimComparison(selectedProjectId)
  const anomaly = getAnomalies(selectedProjectId)
  const confidence = getConfidence(selectedProjectId)
  const xai = getXai(selectedProjectId)

  function generate() {
    setGenerated(true)
    logAction('Report generated', 'Generated')
  }

  function download() {
    const html = document.getElementById('report-body')?.outerHTML ?? ''
    const blob = new Blob([`<html><head><title>CarbonVerify Report ${p.id}</title></head><body>${html}</body></html>`], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `carbonverify-report-${p.id}.html`; a.click()
    URL.revokeObjectURL(url)
    logAction('Report downloaded', 'Downloaded')
  }

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">EVIDENCE REPORT</div><h1>Project {p.id} report</h1><p>Executive-ready summary of every analytical section.</p></div>
      <div className="heading-actions">
        <button className="button outline" onClick={generate}><FileText size={15} />Generate Report</button>
        <button className="button ghost" onClick={() => window.print()} disabled={!generated}><Printer size={15} />Print</button>
        <button className="button primary" onClick={download} disabled={!generated}><Download size={15} />Download</button>
      </div>
    </div>
    {!generated && <div className="notice"><div className="notice-icon"><FileText size={17} /></div><div><strong>No report generated yet</strong><span>Click "Generate Report" to compile the current project's evidence into a printable document.</span></div></div>}
    {generated && <section className="panel report-body" id="report-body">
      <h2>CarbonVerify Evidence Report — Project {p.id}</h2>
      <h4>Executive Summary</h4>
      <p>Project {p.id} claims "{p.claim}". Observed NDVI moved from {p.ndviBefore} to {p.ndviAfter} (Δ {(p.ndviAfter - p.ndviBefore).toFixed(3)}). Analytical consistency score: {claim.consistencyScore}/100 ({claim.verdict}). Confidence: {confidence.overall}/100.</p>
      <h4>Project Information</h4>
      <p>Area: {p.area} · Data source: {p.source} · Observation period: {p.periodBefore} → {p.periodAfter} · Data quality: {p.dataQuality}</p>
      <h4>Spectral Indices</h4>
      <ul>{idx.map(i => <li key={i.key}>{i.label}: {i.before} → {i.after} (Δ {i.delta >= 0 ? '+' : ''}{i.delta})</li>)}</ul>
      <h4>Change Detection</h4>
      <p>Improved {p.improvedPct}% · Declined {p.declinedPct}% · Stable {p.stablePct}%</p>
      <h4>Anomalies</h4>
      <p>Score {anomaly.score}/100 · {anomaly.severity} severity · {anomaly.status}</p>
      <h4>Claim vs Observation</h4>
      <p>{claim.components.map(c => `${c.label}: ${c.score}`).join(' · ')}</p>
      <h4>Confidence</h4>
      <p>{confidence.components.map(c => `${c.label}: ${c.score}`).join(' · ')}</p>
      <h4>Explainable AI</h4>
      <p>{xai.map(x => `${x.feature}: ${x.contribution}% (${x.direction})`).join(' · ')}</p>
      <h4>Limitations</h4>
      <p>Prototype system. No raw satellite imagery, per-pixel rasters, ground-truth labels, or trained ML models were included in the supplied dataset. Anomaly screening and Explainable AI use transparent deterministic rules, not a trained Isolation Forest or SHAP. This report is not a certification.</p>
    </section>}
  </>
}
