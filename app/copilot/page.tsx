'use client'
import { useState } from 'react'
import { ArrowUpRight, Bot } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { copilotAnswer, SUGGESTIONS } from '@/lib/copilot'

interface Msg { role: 'user' | 'assistant'; text: string; evidence?: string }

export default function CopilotPage() {
  const { selectedProjectId, logAction } = useApp()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')

  function ask(question: string) {
    const a = copilotAnswer(question, selectedProjectId)
    setMessages(m => [...m, { role: 'user', text: question }, { role: 'assistant', text: a.text, evidence: a.evidence }])
    logAction(`AI question asked: ${question}`)
    setInput('')
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow">AI COPILOT</div><h1>Ask about Project {selectedProjectId}</h1><p>Evidence-grounded answers, generated only from this project's data layer.</p></div></div>
    <section className="panel copilot-page">
      <div className="copilot-status"><i /> DEMO AI MODE <span>·</span> no LLM_API_KEY configured — answers are deterministic and evidence-grounded</div>
      <div className="copilot-thread page-thread">
        {messages.length === 0 && <div className="copilot-message"><span className="message-label">ANALYST RESPONSE</span><p>{copilotAnswer('overview', selectedProjectId).text}</p></div>}
        {messages.map((m, i) => m.role === 'user'
          ? <div className="copilot-user-msg" key={i}>{m.text}</div>
          : <div className="copilot-message" key={i}><span className="message-label">ANALYST RESPONSE</span><p>{m.text}</p>{m.evidence && <div className="evidence-used"><strong>EVIDENCE USED</strong><span>{m.evidence}</span></div>}</div>)}
      </div>
      <div className="suggestions"><span>Ask about the evidence</span>{SUGGESTIONS.map(s => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>
      <form className="copilot-input" onSubmit={e => { e.preventDefault(); if (input.trim()) ask(input.trim()) }}>
        <input placeholder={`Ask about Project ${selectedProjectId}...`} value={input} onChange={e => setInput(e.target.value)} />
        <button type="submit"><ArrowUpRight size={16} /></button>
      </form>
    </section>
  </>
}
