'use client'
import { useCallback, useRef, useState } from 'react'
import { Layers3, Maximize2, Minimize2 } from 'lucide-react'

export default function EvidenceSlider({ projectId, periodBefore, periodAfter }: { projectId: string; periodBefore: string; periodAfter: string }) {
  const [split, setSplit] = useState(50)
  const [full, setFull] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSplit(Math.min(92, Math.max(8, Math.round(pct))))
  }, [])

  return <div className={`evidence-map ${full ? 'fullscreen' : ''}`} ref={ref}
    onMouseMove={e => dragging.current && updateFromClientX(e.clientX)}
    onMouseUp={() => (dragging.current = false)}
    onMouseLeave={() => (dragging.current = false)}
    onTouchMove={e => e.touches[0] && updateFromClientX(e.touches[0].clientX)}
  >
    <div className="map-grid" />
    <div className="map-contours one" /><div className="map-contours two" /><div className="map-contours three" />
    <div className="map-label top-left">SENTINEL-2 / NDVI — PROJECT {projectId}</div>
    <div className="map-label bottom-left">ILLUSTRATIVE EVIDENCE VIEWER · NO RAW BANDS LOADED</div>
    <div className="map-label before">BEFORE <em>{periodBefore}</em></div>
    <div className="map-label after">AFTER <em>{periodAfter}</em></div>
    <div className="split-after" style={{ clipPath: `inset(0 0 0 ${split}%)` }} />
    <div className="split-line" style={{ left: `${split}%` }}>
      <button aria-label="Drag before after divider" onMouseDown={() => (dragging.current = true)} onTouchStart={() => (dragging.current = true)}>
        <span /><span /><span />
      </button>
    </div>
    <input className="map-range" aria-label="Before and after comparison" type="range" min={8} max={92} value={split} onChange={e => setSplit(Number(e.target.value))} />
    <div className="map-legend"><span>LOW</span><i /><span>HIGH</span></div>
    <div className="map-controls">
      <button aria-label="Reset" onClick={() => setSplit(50)}><Layers3 size={15} /></button>
      <button aria-label="Fullscreen toggle" onClick={() => setFull(v => !v)}>{full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
    </div>
  </div>
}
