'use client'
import { useApp } from '@/context/AppContext'

export default function AuditPage() {
  const { auditLog } = useApp()
  return <>
    <div className="page-heading"><div><div className="eyebrow">AUDIT TRAIL</div><h1>Real activity log</h1><p>Every navigation, project switch, AI question, and report generation this session, newest first.</p></div></div>
    <section className="projects-panel">
      <div className="table-wrap"><table><thead><tr><th>Timestamp</th><th>Project</th><th>Action</th><th>Status</th></tr></thead><tbody>
        {auditLog.map(e => <tr key={e.id}><td>{new Date(e.timestamp).toLocaleString()}</td><td>Project {e.project}</td><td>{e.action}</td><td>{e.status}</td></tr>)}
        {auditLog.length === 0 && <tr><td colSpan={4} className="empty-row">No activity recorded yet.</td></tr>}
      </tbody></table></div>
    </section>
  </>
}
