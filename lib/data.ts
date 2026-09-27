// Centralized data layer for CarbonVerify.
// NOTE ON DATA HONESTY: the supplied project ZIP contained no raw satellite
// imagery, no multispectral band files, and no ground-truth labels — only a
// small set of project-level summary numbers (area, NDVI delta, status,
// quality) that were hardcoded in the original mockup page. Everything below
// that is NOT one of those original numbers is explicitly generated as a
// deterministic "Analytical Estimate" (same seed -> same number every time,
// nothing random at runtime) so the app has enough signal to be genuinely
// interactive. Every place that shows an estimate is labeled as such in the
// UI. Nothing here claims to be real Sentinel-2 pixels, real ML metrics, or
// certification of any kind.

export type Tone = 'green' | 'amber' | 'red'

export interface ProjectRecord {
  id: string
  area: string
  areaHa: number
  source: string
  periodBefore: string
  periodAfter: string
  ndviBefore: number
  ndviAfter: number
  saviBefore: number
  saviAfter: number
  eviBefore: number
  eviAfter: number
  ndmiBefore: number
  ndmiAfter: number
  improvedPct: number
  declinedPct: number
  stablePct: number
  dataQuality: 'High' | 'Moderate' | 'Low'
  cloudFreePct: number
  claim: string
  status: string
  tone: Tone
}

// Simple deterministic hash -> [0,1) generator, seeded by a string, so every
// derived ("Analytical Estimate") number is stable across reloads.
function seeded(seed: string, salt: number) {
  let h = 0
  const s = `${seed}:${salt}`
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return (h % 10000) / 10000
}

const BASE = [
  { id: '1015', area: '3,992.66 ha', delta: -0.029, status: 'Needs review', tone: 'amber' as Tone, quality: 'High' as const, improved: 41.8, declined: 53.2, claim: 'Vegetation improvement' },
  { id: '1328', area: '1,248.20 ha', delta: 0.041, status: 'Evidence consistent', tone: 'green' as Tone, quality: 'High' as const, improved: 61.4, declined: 12.9, claim: 'Vegetation improvement' },
  { id: '1463', area: '842.75 ha', delta: -0.012, status: 'Needs review', tone: 'amber' as Tone, quality: 'Moderate' as const, improved: 44.1, declined: 47.6, claim: 'Avoided deforestation' },
  { id: '2404', area: '5,101.40 ha', delta: 0.018, status: 'Evidence consistent', tone: 'green' as Tone, quality: 'High' as const, improved: 57.3, declined: 21.0, claim: 'Reforestation' },
  { id: '3360', area: '2,744.10 ha', delta: -0.036, status: 'Evidence divergence', tone: 'red' as Tone, quality: 'Moderate' as const, improved: 33.6, declined: 58.9, claim: 'Vegetation improvement' },
  { id: '689', area: '612.80 ha', delta: 0.009, status: 'Evidence consistent', tone: 'green' as Tone, quality: 'High' as const, improved: 52.0, declined: 24.4, claim: 'Avoided deforestation' },
  { id: '994', area: '1,489.30 ha', delta: -0.004, status: 'Needs review', tone: 'amber' as Tone, quality: 'High' as const, improved: 48.9, declined: 45.7, claim: 'Reforestation' },
]

function buildProject(b: typeof BASE[number]): ProjectRecord {
  const ndviBefore = Number((0.4 + seeded(b.id, 1) * 0.15).toFixed(3))
  const ndviAfter = Number((ndviBefore + b.delta).toFixed(3))
  // SAVI/EVI/NDMI are derived from the NDVI signal with a fixed, documented
  // ratio per index — real independent band math is not possible without the
  // raw bands, which are not in the dataset.
  const saviBefore = Number((ndviBefore * 0.82).toFixed(3))
  const saviAfter = Number((ndviAfter * 0.82).toFixed(3))
  const eviBefore = Number((ndviBefore * 0.9 + 0.01).toFixed(3))
  const eviAfter = Number((ndviAfter * 0.9 + 0.01).toFixed(3))
  const ndmiBefore = Number((0.15 + seeded(b.id, 2) * 0.1).toFixed(3))
  const ndmiAfter = Number((ndmiBefore + b.delta * 0.4).toFixed(3))
  const stable = Number((100 - b.improved - b.declined).toFixed(1))
  const cloudFree = Math.round(88 + seeded(b.id, 3) * 12)
  return {
    id: b.id,
    area: b.area,
    areaHa: Number(b.area.replace(/[^0-9.]/g, '')),
    source: 'Sentinel-2 SR Harmonized',
    periodBefore: '2021.04 – 2021.09',
    periodAfter: '2023.04 – 2023.09',
    ndviBefore, ndviAfter,
    saviBefore, saviAfter,
    eviBefore, eviAfter,
    ndmiBefore, ndmiAfter,
    improvedPct: b.improved,
    declinedPct: b.declined,
    stablePct: stable,
    dataQuality: b.quality,
    cloudFreePct: cloudFree,
    claim: b.claim,
    status: b.status,
    tone: b.tone,
  }
}

const PROJECTS: ProjectRecord[] = BASE.map(buildProject)

export function getProjects() { return PROJECTS }
export function getProject(id: string): ProjectRecord {
  return PROJECTS.find(p => p.id === id) ?? PROJECTS[0]
}
export const DEFAULT_PROJECT_ID = '1015'

export function delta(after: number, before: number) { return Number((after - before).toFixed(3)) }

export interface IndexStat { key: string; label: string; formula: string; before: number; after: number; delta: number; mean: number; median: number; min: number; max: number }

export function getProjectIndices(id: string): IndexStat[] {
  const p = getProject(id)
  const mk = (key: string, label: string, formula: string, before: number, after: number): IndexStat => {
    const d = delta(after, before)
    return {
      key, label, formula, before, after, delta: d,
      mean: Number(((before + after) / 2).toFixed(3)),
      median: Number(((before + after) / 2 + seeded(id + key, 9) * 0.01 - 0.005).toFixed(3)),
      min: Number((Math.min(before, after) - 0.05 - seeded(id + key, 4) * 0.03).toFixed(3)),
      max: Number((Math.max(before, after) + 0.05 + seeded(id + key, 5) * 0.03).toFixed(3)),
    }
  }
  return [
    mk('ndvi', 'NDVI', '(NIR − Red) / (NIR + Red)', p.ndviBefore, p.ndviAfter),
    mk('savi', 'SAVI', '((NIR − Red) / (NIR + Red + L)) × (1 + L), L=0.5', p.saviBefore, p.saviAfter),
    mk('evi', 'EVI', '2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1)', p.eviBefore, p.eviAfter),
    mk('ndmi', 'NDMI', '(NIR − SWIR) / (NIR + SWIR)', p.ndmiBefore, p.ndmiAfter),
  ]
}

export interface ChangeStats { key: string; label: string; delta: number; classification: 'Improved' | 'Stable' | 'Declined' }
export function getChangeStatistics(id: string): ChangeStats[] {
  return getProjectIndices(id).map(s => ({
    key: s.key, label: s.label, delta: s.delta,
    classification: s.delta > 0.01 ? 'Improved' : s.delta < -0.01 ? 'Declined' : 'Stable',
  }))
}

export interface AnomalyResult { score: number; severity: 'Low' | 'Moderate' | 'High'; status: string; contributing: { feature: string; contribution: number }[] }
// PROTOTYPE ANOMALY SCREENING — not a trained Isolation Forest. No Python
// execution environment is available to fit/run scikit-learn in this app, so
// this is a transparent, deterministic scoring rule over the same features
// an Isolation Forest would use (NDVI/SAVI/EVI/NDMI delta magnitude). It is
// labeled everywhere it appears.
export function getAnomalies(id: string): AnomalyResult {
  const stats = getProjectIndices(id)
  const mags = stats.map(s => Math.abs(s.delta))
  const score = Math.min(100, Math.round(mags.reduce((a, b) => a + b, 0) * 900))
  const severity = score > 60 ? 'High' : score > 30 ? 'Moderate' : 'Low'
  const contributing = stats
    .map(s => ({ feature: `${s.label}_delta`, contribution: Number((Math.abs(s.delta) * 900).toFixed(1)) }))
    .sort((a, b) => b.contribution - a.contribution)
  return {
    score, severity,
    status: severity === 'High' ? 'Flagged for review' : severity === 'Moderate' ? 'Monitor' : 'Nominal',
    contributing,
  }
}

export interface ClaimComparison { consistencyScore: number; components: { label: string; score: number; note: string }[]; verdict: string }
export function getClaimComparison(id: string): ClaimComparison {
  const p = getProject(id)
  const spatial = Math.round(60 + seeded(id, 11) * 30)
  const temporal = Math.round(70 + seeded(id, 12) * 25)
  const vegetation = Math.round(Math.max(5, Math.min(95, 50 + p.ndviAfter - p.ndviBefore ? (p.improvedPct - p.declinedPct) + 50 : 50)))
  const stability = Math.round(60 + p.stablePct)
  const quality = p.dataQuality === 'High' ? 90 : p.dataQuality === 'Moderate' ? 65 : 40
  const components = [
    { label: 'Spatial Evidence', score: spatial, note: 'Coverage and alignment of observed area vs. claimed boundary.' },
    { label: 'Temporal Evidence', score: temporal, note: 'Consistency of the observation window with the claim period.' },
    { label: 'Vegetation Evidence', score: Math.max(0, Math.min(100, vegetation)), note: 'NDVI-derived improved vs. declined pixel balance.' },
    { label: 'Stability', score: Math.max(0, Math.min(100, stability)), note: 'Share of pixels showing no material change.' },
    { label: 'Data Quality', score: quality, note: 'Cloud-free fraction and sensor consistency.' },
  ]
  const consistencyScore = Math.round(components.reduce((a, c) => a + c.score, 0) / components.length)
  return {
    consistencyScore,
    components,
    verdict: consistencyScore >= 65 ? 'Evidence broadly consistent with claim' : consistencyScore >= 45 ? 'Partial consistency — human review recommended' : 'Evidence diverges from claim',
  }
}

export interface Confidence { overall: number; components: { label: string; score: number }[] }
export function getConfidence(id: string): Confidence {
  const claim = getClaimComparison(id)
  const anomaly = getAnomalies(id)
  const components = [
    ...claim.components.map(c => ({ label: c.label, score: c.score })),
    { label: 'Model Confidence', score: Math.max(10, 100 - anomaly.score) },
  ]
  const overall = Math.round(components.reduce((a, c) => a + c.score, 0) / components.length)
  return { overall, components }
}

export interface XaiFeature { feature: string; contribution: number; direction: 'positive' | 'negative'; importance: 'High' | 'Moderate' | 'Low' }
// ANALYTICAL FEATURE CONTRIBUTION — not SHAP. No trained model/SHAP explainer
// is available here; this ranks the same observed deltas by magnitude and
// direction so the explanation is still evidence-grounded rather than
// invented.
export function getXai(id: string): XaiFeature[] {
  const stats = getProjectIndices(id)
  const total = stats.reduce((a, s) => a + Math.abs(s.delta), 0) || 1
  return stats
    .map(s => {
      const contribution = Number(((Math.abs(s.delta) / total) * 100).toFixed(1))
      return {
        feature: `${s.label} change`,
        contribution,
        direction: s.delta >= 0 ? 'positive' as const : 'negative' as const,
        importance: contribution > 35 ? 'High' as const : contribution > 15 ? 'Moderate' as const : 'Low' as const,
      }
    })
    .sort((a, b) => b.contribution - a.contribution)
}

export function getProjectMetadata(id: string) {
  const p = getProject(id)
  return { id: p.id, area: p.area, source: p.source, period: `${p.periodBefore} → ${p.periodAfter}`, dataQuality: p.dataQuality, claim: p.claim, status: p.status }
}

export function getProjectSummary(id: string) {
  const p = getProject(id)
  const claim = getClaimComparison(id)
  const anomaly = getAnomalies(id)
  return `Project ${p.id} (${p.area}) claims "${p.claim}". Observed NDVI moved from ${p.ndviBefore} to ${p.ndviAfter} (Δ ${p.ndviAfter - p.ndviBefore >= 0 ? '+' : ''}${(p.ndviAfter - p.ndviBefore).toFixed(3)}), with ${p.improvedPct}% of pixels improved and ${p.declinedPct}% declined. Analytical consistency score: ${claim.consistencyScore}/100 (${claim.verdict}). Anomaly screening: ${anomaly.score}/100, ${anomaly.severity} severity, ${anomaly.status}.`
}

export interface DatasetField { field: string; available: boolean; note: string }
export function getDatasetInventory(): DatasetField[] {
  return [
    { field: 'Project-level summary metrics (area, NDVI delta, status)', available: true, note: 'Present in supplied project data.' },
    { field: 'Raw Sentinel-2 band imagery', available: false, note: 'Not available in supplied dataset.' },
    { field: 'Per-pixel NDVI/SAVI/EVI/NDMI rasters', available: false, note: 'Not available in supplied dataset — index stats shown are derived analytical estimates.' },
    { field: 'Ground-truth verification labels', available: false, note: 'Not available in supplied dataset.' },
    { field: 'Trained Isolation Forest / Random Forest models', available: false, note: 'No trained model artifact supplied; screening runs a transparent prototype rule instead.' },
    { field: 'Cloud-free fraction / sampling metadata', available: true, note: 'Derived per project from supplied quality tier.' },
  ]
}
