'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, Bot, CircleHelp, Database, FileText, Gauge, Layers3,
  Menu, MoreHorizontal, Play, Radar, ScanSearch, Search as SearchIcon, Settings as SettingsIcon,
  ShieldCheck, Sparkles, Satellite, X, Zap, BookOpenCheck, ClipboardList,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getProject, getProjects } from '@/lib/data'
import CopilotDrawer from './CopilotDrawer'
import DemoOverlay from './DemoOverlay'

const NAV = [
  { label: 'Overview', href: '/overview', icon: Gauge },
  { label: 'Projects', href: '/projects', icon: Layers3 },
  { label: 'Satellite Evidence', href: '/satellite', icon: Satellite },
  { label: 'Spectral Analysis', href: '/spectral', icon: Radar },
  { label: 'Change Detection', href: '/change', icon: ScanSearch },
  { label: 'Anomalies', href: '/anomalies', icon: AlertTriangle },
  { label: 'Claim vs Observation', href: '/claim-observation', icon: ShieldCheck },
  { label: 'Confidence', href: '/confidence', icon: Gauge },
  { label: 'Explainable AI', href: '/xai', icon: Sparkles },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Audit Trail', href: '/audit', icon: Activity },
  { label: 'AI Copilot', href: '/copilot', icon: Bot },
  { label: 'Datasets', href: '/datasets', icon: Database },
  { label: 'Viva Mode', href: '/viva', icon: BookOpenCheck },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
]

function Brand() {
  return <div className="brand"><div className="brand-mark"><span /><span /><span /></div><div><strong>CARBON<span>VERIFY</span></strong><small>EVIDENCE BEFORE ASSURANCE</small></div></div>
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { selectedProjectId, setSelectedProjectId, logAction, setCopilotOpen, setDemoOpen, searchQuery, setSearchQuery } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const project = getProject(selectedProjectId)
  const activeLabel = NAV.find(n => pathname?.startsWith(n.href))?.label ?? 'Overview'

  useEffect(() => {
    logAction(`Page opened: ${activeLabel}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const results = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const projectHits = getProjects().filter(p => p.id.includes(q) || p.claim.toLowerCase().includes(q)).map(p => ({ label: `Project ${p.id}`, href: `/projects/${p.id}` }))
    const pageHits = NAV.filter(n => n.label.toLowerCase().includes(q)).map(n => ({ label: n.label, href: n.href }))
    return [...projectHits, ...pageHits].slice(0, 8)
  }, [searchQuery])

  return <main className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <Brand />
      <div className="workspace-label">WORKSPACE <span>LIVE</span></div>
      <nav>
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={activeLabel === label ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            <Icon size={16} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button onClick={() => logAction('Documentation opened')}><CircleHelp size={16} />Documentation</button>
        <button><Zap size={16} />System status <i className="online-dot" /></button>
        <div className="user-card"><div className="avatar">TB</div><div><strong>Tabish</strong><small>Researcher</small></div><MoreHorizontal size={16} /></div>
      </div>
    </aside>

    <section className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileOpen(v => !v)}><Menu size={20} /></button>
        <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeLabel}</strong></div>
        <div className="top-search-wrap">
          <div className="search-button as-input">
            <SearchIcon size={15} />
            <input placeholder="Search projects, pages, evidence…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && <button className="clear-search" onClick={() => setSearchQuery('')}><X size={13} /></button>}
          </div>
          {results.length > 0 && <div className="search-results">
            {results.map(r => <button key={r.href} onClick={() => { router.push(r.href); setSearchQuery('') }}>{r.label}</button>)}
          </div>}
        </div>
        <div className="top-actions">
          <div className="project-mini" onClick={() => setProjectMenuOpen(v => !v)}>
            <Satellite size={14} /><span>Project {project.id}</span>
            {projectMenuOpen && <div className="project-mini-menu">
              {getProjects().map(p => <button key={p.id} className={p.id === selectedProjectId ? 'active' : ''} onClick={(e) => { e.stopPropagation(); setSelectedProjectId(p.id); setProjectMenuOpen(false) }}>Project {p.id}</button>)}
            </div>}
          </div>
          <button className="icon-button" onClick={() => setDemoOpen(true)} title="Launch 3-minute demo"><Play size={15} /></button>
          <button className="icon-button" onClick={() => setCopilotOpen(true)} title="AI Copilot"><Bot size={17} /></button>
          <button className="avatar small">TB</button>
        </div>
      </header>
      <div className="content">{children}</div>
      <footer><span><ClipboardList size={14} /> CARBONVERIFY <b>v0.9.2-prototype</b></span><span>Evidence before assurance</span></footer>
    </section>
    <CopilotDrawer />
    <DemoOverlay />
  </main>
}
