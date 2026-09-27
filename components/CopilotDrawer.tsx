'use client'
import { useState } from 'react'
import { Bot, ArrowUpRight, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { copilotAnswer, SUGGESTIONS } from '@/lib/copilot'

interface Msg { role: 'user' | 'assistant'; text: string; evidence?: string }

export default function CopilotDrawer() {
  const { copilotOpen, setCopilotOpen, selectedProjectId, logAction } = useApp()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')

  if (!copilotOpen) return null

  function ask(question: string) {
    const a = copilotAnswer(question, selectedProjectId)
    setMessages(m => [...m, { role: 'user', text: question }, { role: 'assistant', text: a.text, evidence: a.evidence }])
    logAction(`AI question asked: ${question}`)
    setInput('')
  }

  return <div className="copilot-drawer">
    <div className="drawer-header"><div className="copilot-icon"><Bot size={18} /></div><div><strong>CarbonVerify Copilot</strong><small>Evidence-grounded environmental intelligence</small></div><button onClick={() => setCopilotOpen(false)}><X size={17} /></button></div>
    <div className="copilot-status"><i /> DEMO AI MODE <span>·</span> grounded on Project {selectedProjectId} data</div>
    <div className="copilot-thread">
      {messages.length === 0 && <div className="copilot-message"><span className="message-label">ANALYST RESPONSE</span><p>{copilotAnswer('overview', selectedProjectId).text}</p><small>Analytical interpretation only. This does not constitute certification or a legal determination.</small></div>}
      {messages.map((m, i) => m.role === 'user'
        ? <div className="copilot-user-msg" key={i}>{m.text}</div>
        : <div className="copilot-message" key={i}><span className="message-label">ANALYST RESPONSE</span><p>{m.text}</p>{m.evidence && <div className="evidence-used"><strong>EVIDENCE USED</strong><span>{m.evidence}</span></div>}</div>)}
    </div>
    <div className="suggestions"><span>Ask about the evidence</span>{SUGGESTIONS.map(s => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>
    <form className="copilot-input" onSubmit={e => { e.preventDefault(); if (input.trim()) ask(input.trim()) }}>
      <input placeholder={`Ask about Project ${selectedProjectId}...`} value={input} onChange={e => setInput(e.target.value)} />
      <button type="submit"><ArrowUpRight size={16} /></button>
    </form>
  </div>
}
