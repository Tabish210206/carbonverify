import { NextRequest, NextResponse } from 'next/server'
import { getProjectSummary, getAnomalies, getClaimComparison, getConfidence, getXai, getProjectIndices } from '@/lib/data'

// Optional server-side LLM integration.
// Disabled by default: this route only calls out to a real LLM if
// LLM_API_KEY is set as an environment variable, and the key never reaches
// the client. Without it, the app uses the deterministic DEMO AI MODE in
// lib/copilot.ts and never calls this route.
export async function POST(req: NextRequest) {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ mode: 'demo', message: 'LLM_API_KEY not configured — use client-side DEMO AI MODE (lib/copilot.ts).' }, { status: 200 })
  }

  const { question, projectId } = await req.json()
  if (!question || !projectId) return NextResponse.json({ error: 'question and projectId are required' }, { status: 400 })

  // Evidence-grounding tools: the model is only given real computed facts
  // about the selected project, so it cannot invent NDVI values, scores, etc.
  const context = {
    summary: getProjectSummary(projectId),
    indices: getProjectIndices(projectId),
    claim: getClaimComparison(projectId),
    confidence: getConfidence(projectId),
    anomaly: getAnomalies(projectId),
    xai: getXai(projectId),
  }

  const provider = process.env.LLM_PROVIDER ?? 'anthropic'
  const model = process.env.LLM_MODEL ?? 'claude-sonnet-4-6'

  try {
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          system: 'You are the CarbonVerify evidence analyst. Answer ONLY using the JSON evidence context provided. Never invent numbers. Cite which fields you used.',
          messages: [{ role: 'user', content: `Evidence context: ${JSON.stringify(context)}\n\nQuestion: ${question}` }],
        }),
      })
      const data = await res.json()
      const text = data?.content?.map((c: any) => c.text).filter(Boolean).join('\n') ?? 'No response from model.'
      return NextResponse.json({ mode: 'live', text })
    }
    return NextResponse.json({ mode: 'demo', message: `Unsupported LLM_PROVIDER "${provider}".` })
  } catch (err) {
    return NextResponse.json({ mode: 'demo', message: 'LLM call failed; fall back to DEMO AI MODE.', error: String(err) }, { status: 200 })
  }
}
