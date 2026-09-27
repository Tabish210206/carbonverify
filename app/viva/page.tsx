'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { copilotAnswer } from '@/lib/copilot'

const TOPICS = [
  { q: 'Problem Statement', a: 'Carbon credit claims are hard to independently verify. CarbonVerify compares a project\'s stated claim against Earth-observation evidence and surfaces where they diverge.' },
  { q: 'Objectives', a: 'Give evaluators a transparent, evidence-first way to check vegetation-based claims: satellite comparison, spectral indices, change detection, anomaly screening, and a consistency score.' },
  { q: 'Architecture', a: 'Next.js App Router frontend, a centralized data layer (lib/data.ts) shared by every page, and a server-boundary-ready Copilot that answers only from that data layer.' },
  { q: 'Dataset', a: 'Seven projects with area, NDVI delta, status, and quality tier. Raw bands and ground truth were not supplied — every other figure is a clearly labeled analytical estimate.' },
  { q: 'Preprocessing', a: 'Deterministic derivation of SAVI/EVI/NDMI from the NDVI signal using fixed, documented ratios, since raw bands are unavailable.' },
  { q: 'NDVI / SAVI / EVI / NDMI', a: 'Standard vegetation indices. NDVI = (NIR−Red)/(NIR+Red); SAVI adds a soil-brightness correction; EVI corrects for atmosphere and canopy background; NDMI tracks moisture via SWIR.' },
  { q: 'Change Detection', a: 'AFTER − BEFORE per index, classified Improved / Stable / Declined against a ±0.01 threshold.' },
  { q: 'Isolation Forest', a: 'The preferred model for anomaly detection, but no Python execution environment is available here, so this app runs a labeled prototype rule instead of a trained model.' },
  { q: 'Random Forest / XGBoost', a: 'Preferred classifiers if ground-truth labels existed. Since none were supplied, classification is explicitly shown as prototype mode with "ground truth not available."' },
  { q: 'SHAP', a: 'Not run here — no trained model to explain. Explainability instead ranks observed index deltas by magnitude/direction as an "analytical feature contribution."' },
  { q: 'LLM / AI Copilot', a: 'No LLM_API_KEY is configured, so Copilot runs in DEMO AI MODE: deterministic answers built only from the same project data functions, cited as "evidence used."' },
  { q: 'Claim vs Observation', a: 'A five-component analytical consistency score (spatial, temporal, vegetation, stability, data quality) compares the stated claim to observed evidence.' },
  { q: 'Confidence', a: 'Mean of the five consistency components plus model confidence (100 − anomaly score).' },
  { q: 'Audit', a: 'Every project switch, page visit, AI question, and report generation is logged client-side with a timestamp, visible on the Audit Trail page.' },
  { q: 'Limitations', a: 'No raw imagery, no ground truth, no trained ML models. Every derived number is labeled as an analytical estimate or prototype, never presented as certification.' },
  { q: 'Future Scope', a: 'Swap in real Sentinel-2 tiles and a trained Isolation Forest/Random Forest pipeline behind the same data-layer interface without changing the UI.' },
]

export default function VivaPage() {
  const { selectedProjectId } = useApp()
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const topic = TOPICS[i]
  const extra = copilotAnswer(topic.q, selectedProjectId)

  return <>
    <div className="page-heading"><div><div className="eyebrow">VIVA MODE</div><h1>Interactive viva copilot</h1><p>Topic {i + 1} / {TOPICS.length}</p></div></div>
    <section className="panel viva-card">
      <h3>{topic.q}</h3>
      {show && <p>{topic.a}</p>}
      {show && <div className="notice"><div className="notice-icon">i</div><div><strong>Grounded in Project {selectedProjectId}</strong><span>{extra.text}</span></div></div>}
      <div className="demo-controls">
        <button className="button ghost" disabled={i === 0} onClick={() => { setI(i - 1); setShow(false) }}>Previous</button>
        <button className="button outline" onClick={() => setShow(v => !v)}>{show ? 'Hide Answer' : 'Show Answer'}</button>
        <button className="button ghost" onClick={() => setShow(true)}>Explain More</button>
        <button className="button primary" disabled={i === TOPICS.length - 1} onClick={() => { setI(i + 1); setShow(false) }}>Next</button>
      </div>
    </section>
  </>
}
