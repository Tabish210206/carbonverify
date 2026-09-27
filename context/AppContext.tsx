'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_PROJECT_ID, getProjects } from '@/lib/data'

export interface AuditEntry { id: string; timestamp: string; project: string; action: string; status: string }

interface AppState {
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  auditLog: AuditEntry[]
  logAction: (action: string, status?: string, projectId?: string) => void
  copilotOpen: boolean
  setCopilotOpen: (v: boolean) => void
  demoOpen: boolean
  setDemoOpen: (v: boolean) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
}

const AppCtx = createContext<AppState | null>(null)

const STORAGE_KEY = 'carbonverify.selectedProjectId'
const AUDIT_KEY = 'carbonverify.auditLog'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedProjectId, setSelectedProjectIdState] = useState(DEFAULT_PROJECT_ID)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved && getProjects().some(p => p.id === saved)) setSelectedProjectIdState(saved)
      const savedAudit = window.localStorage.getItem(AUDIT_KEY)
      if (savedAudit) setAuditLog(JSON.parse(savedAudit))
    } catch {}
  }, [])

  const logAction = useCallback((action: string, status = 'Recorded', projectId?: string) => {
    setAuditLog(prev => {
      const entry: AuditEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        project: projectId ?? selectedProjectId,
        action, status,
      }
      const next = [entry, ...prev].slice(0, 300)
      try { window.localStorage.setItem(AUDIT_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [selectedProjectId])

  const setSelectedProjectId = useCallback((id: string) => {
    setSelectedProjectIdState(id)
    try { window.localStorage.setItem(STORAGE_KEY, id) } catch {}
    logAction('Project selected', 'Changed', id)
  }, [logAction])

  const value = useMemo(() => ({
    selectedProjectId, setSelectedProjectId, auditLog, logAction,
    copilotOpen, setCopilotOpen, demoOpen, setDemoOpen, searchQuery, setSearchQuery,
  }), [selectedProjectId, setSelectedProjectId, auditLog, logAction, copilotOpen, demoOpen, searchQuery])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
