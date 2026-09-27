'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Check, Pause, Play, RotateCcw, Satellite, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const STEPS = [
  { label: 'Overview', href: '/overview' },
  { label: 'Project selected', href: '/projects/1015' },
  { label: 'Satellite evidence', href: '/satellite' },
  { label: 'Spectral analysis', href: '/spectral' },
  { label: 'Change detection', href: '/change' },
  { label: 'Anomalies', href: '/anomalies' },
  { label: 'Claim vs observation', href: '/claim-observation' },
  { label: 'Confidence & XAI', href: '/confidence' },
  { label: 'AI Copilot', href: '/copilot' },
  { label: 'Report & audit', href: '/reports' },
]

export default function DemoOverlay() {
  const { demoOpen, setDemoOpen, logAction } = useApp()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setStep(s => Math.min(STEPS.length - 1, s + 1)), 3500)
    return () => clearTimeout(t)
  }, [playing, step])

  if (!demoOpen) return null

  function goto(i: number) {
    setStep(i)
    router.push(STEPS[i].href)
    logAction(`Demo step: ${STEPS[i].label}`)
  }

  return <div className="demo-overlay">
    <div className="demo-modal">
      <button className="close-demo" onClick={() => { setDemoOpen(false); setPlaying(false) }}><X size={18} /></button>
      <div className="demo-orbit"><Satellite size={24} /></div>
      <span className="eyebrow">GUIDED EVIDENCE STORY · {String(step + 1).padStart(2, '0')} / {STEPS.length}</span>
      <h2>{STEPS[step].label}</h2>
      <p>CarbonVerify turns project claims into a transparent chain of Earth-observation signals, analysis, explanation, and audit.</p>
      <div className="demo-steps">
        {STEPS.map((s, i) => <span key={s.label} className={i < step ? 'done' : i === step ? 'current' : ''}>
          {i < step ? <Check size={12} /> : i === step ? <Play size={11} fill="currentColor" /> : null} {s.label}
        </span>)}
      </div>
      <div className="demo-controls">
        <button className="button ghost" disabled={step === 0} onClick={() => goto(step - 1)}>Previous</button>
        <button className="button ghost" onClick={() => setPlaying(p => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Auto-play'}</button>
        <button className="button ghost" onClick={() => goto(0)}><RotateCcw size={14} />Restart</button>
        <button className="button primary" onClick={() => step < STEPS.length - 1 ? goto(step + 1) : (setDemoOpen(false), setPlaying(false))}>
          {step < STEPS.length - 1 ? <>Next <ArrowUpRight size={15} /></> : 'Exit demo'}
        </button>
      </div>
    </div>
  </div>
}
