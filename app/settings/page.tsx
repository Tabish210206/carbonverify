'use client'
import { useApp } from '@/context/AppContext'

export default function SettingsPage() {
  const { selectedProjectId, auditLog } = useApp()
  const rows = [
    { label: 'Application Version', value: 'v0.9.2-prototype' },
    { label: 'Dataset Status', value: '7 projects loaded · summary-level only' },
    { label: 'LLM Status', value: 'DEMO AI MODE (no LLM_API_KEY configured)' },
    { label: 'Current Project', value: `Project ${selectedProjectId}` },
    { label: 'Model Status', value: 'Prototype rules (Anomaly, XAI) — no trained ML artifact loaded' },
    { label: 'System Status', value: 'Operational' },
    { label: 'Audit Entries This Session', value: String(auditLog.length) },
  ]
  return <>
    <div className="page-heading"><div><div className="eyebrow">SETTINGS</div><h1>System settings</h1></div></div>
    <section className="projects-panel">
      <div className="table-wrap"><table><tbody>
        {rows.map(r => <tr key={r.label}><td><strong>{r.label}</strong></td><td>{r.value}</td></tr>)}
      </tbody></table></div>
    </section>
  </>
}
