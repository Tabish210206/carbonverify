'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { getProjectIndices } from '@/lib/data'
import { HowCalculated } from '@/components/ui-bits'

export default function SpectralPage() {
  const { selectedProjectId } = useApp()
  const indices = getProjectIndices(selectedProjectId)
  const [tab, setTab] = useState(indices[0].key)
  const current = indices.find(i => i.key === tab)!

  return <>
    <div className="page-heading"><div><div className="eyebrow">SPECTRAL ANALYSIS</div><h1>Vegetation index breakdown</h1><p>Project {selectedProjectId} · analytical estimates derived from the observed NDVI signal.</p></div>
      <div className="view-tabs">{indices.map(i => <button key={i.key} className={tab === i.key ? 'selected' : ''} onClick={() => setTab(i.key)}>{i.label}</button>)}</div>
    </div>
    <section className="panel">
      <div className="panel-heading"><div><span className="eyebrow">{current.label}</span><h3>{current.formula}</h3></div>
        <HowCalculated title={`${current.label} — how calculated`}>
          <p>Formula: <code>{current.formula}</code></p>
          <p>Raw multispectral bands are not present in the supplied dataset, so before/after values are the project's summary figures and mean/median/min/max are analytical estimates derived from them — not per-pixel raster statistics.</p>
        </HowCalculated>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><div className="metric-copy"><p>Before</p><strong>{current.before}</strong></div></div>
        <div className="metric-card"><div className="metric-copy"><p>After</p><strong>{current.after}</strong></div></div>
        <div className="metric-card"><div className="metric-copy"><p>Delta</p><strong className={current.delta < 0 ? 'red-text' : 'green-text'}>{current.delta >= 0 ? '+' : ''}{current.delta}</strong></div></div>
        <div className="metric-card"><div className="metric-copy"><p>Mean</p><strong>{current.mean}</strong></div></div>
        <div className="metric-card"><div className="metric-copy"><p>Median</p><strong>{current.median}</strong></div></div>
        <div className="metric-card"><div className="metric-copy"><p>Min</p><strong>{current.min}</strong></div></div>
        <div className="metric-card"><div className="metric-copy"><p>Max</p><strong>{current.max}</strong></div></div>
      </div>
    </section>
  </>
}
