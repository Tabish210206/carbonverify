import { getAnomalies, getClaimComparison, getConfidence, getProject, getProjectIndices, getXai } from './data'

export const SUGGESTIONS = [
  'Explain this project.',
  'What changed?',
  'Why does this project need review?',
  'Explain the NDVI change.',
  'What evidence supports this assessment?',
  'How is confidence calculated?',
  'Explain this for my viva.',
]

// DEMO AI MODE — no LLM_API_KEY is configured in this environment, so no live
// model call is made anywhere in this app. Every answer below is built only
// from the evidence-grounding functions in lib/data.ts, never invented.
export function copilotAnswer(question: string, projectId: string): { text: string; evidence: string } {
  const p = getProject(projectId)
  const idx = getProjectIndices(projectId)
  const claim = getClaimComparison(projectId)
  const anomaly = getAnomalies(projectId)
  const confidence = getConfidence(projectId)
  const xai = getXai(projectId)
  const q = question.toLowerCase()
  if (q.includes('viva')) {
    return {
      text: `For your viva: Project ${p.id} claims "${p.claim}". We compare that claim against observed NDVI/SAVI/EVI/NDMI signals. NDVI moved from ${p.ndviBefore} to ${p.ndviAfter}. The analytical consistency score is ${claim.consistencyScore}/100 (${claim.verdict}), and the confidence score is ${confidence.overall}/100. Anomaly screening flags this project as ${anomaly.severity} severity.`,
      evidence: 'getProjectSummary(), getClaimComparison(), getConfidence(), getAnomalies()',
    }
  }
  if (q.includes('confidence')) {
    return { text: `Confidence is the average of five components: ${confidence.components.map(c => `${c.label} ${c.score}`).join(', ')}. Overall: ${confidence.overall}/100.`, evidence: 'getConfidence()' }
  }
  if (q.includes('review')) {
    return { text: `Project ${p.id} is flagged "${p.status}" because ${p.declinedPct}% of monitored pixels declined against a claim of "${p.claim}", giving a consistency score of ${claim.consistencyScore}/100 — below the review threshold.`, evidence: 'getClaimComparison(), getProjectMetadata()' }
  }
  if (q.includes('ndvi')) {
    const ndvi = idx.find(i => i.key === 'ndvi')!
    return { text: `NDVI moved from ${ndvi.before} to ${ndvi.after} (Δ ${ndvi.delta >= 0 ? '+' : ''}${ndvi.delta}), classified as ${ndvi.delta > 0.01 ? 'Improved' : ndvi.delta < -0.01 ? 'Declined' : 'Stable'}.`, evidence: 'getIndexStatistics("ndvi")' }
  }
  if (q.includes('evidence supports')) {
    return { text: `Top contributing signals: ${xai.slice(0, 3).map(x => `${x.feature} (${x.contribution}%, ${x.direction})`).join('; ')}.`, evidence: 'getXAI()' }
  }
  if (q.includes('what changed')) {
    return { text: idx.map(i => `${i.label}: ${i.before} → ${i.after} (Δ ${i.delta >= 0 ? '+' : ''}${i.delta})`).join(' · '), evidence: 'getChangeStatistics()' }
  }
  return { text: `Project ${p.id} (${p.area}) claims "${p.claim}". Observed NDVI: ${p.ndviBefore} → ${p.ndviAfter}. ${p.improvedPct}% improved, ${p.declinedPct}% declined. Assessment: ${p.status}.`, evidence: 'getProjectSummary()' }
}
