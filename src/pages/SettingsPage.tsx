import { type ChangeEvent, useRef, useState } from 'react'
import {
  Download,
  LogOut,
  Moon,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import {
  deleteAllUserData,
  downloadJson,
  exportUserData,
  importUserData,
  type ExportData,
} from '@/services/data'
import { useThemeStore } from '@/stores/themeStore'
import { useToastStore } from '@/stores/toastStore'
import { cn } from '@/utils'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const addToast = useToastStore((s) => s.addToast)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loggingOut, setLoggingOut] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } finally {
      setLoggingOut(false)
    }
  }

  const handleExport = async () => {
    if (!user) return
    setExporting(true)
    try {
      const data = await exportUserData(user.uid)
      downloadJson(data, `taskflow-backup-${getDateKey()}.json`)
      addToast('Database exported')
    } catch {
      addToast('Export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportData
      const result = await importUserData(user.uid, data)
      addToast(`Imported ${result.projects} projects, ${result.tasks} tasks`)
    } catch {
      addToast('Import failed — check file format', 'error')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAll = async () => {
    if (!user) return
    setDeleting(true)
    try {
      await deleteAllUserData(user.uid)
      addToast('All data deleted', 'info')
      setConfirmDelete(false)
    } catch {
      addToast('Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const isDark = theme === 'dark'

  return (
    <div>
      <Header title="Settings" subtitle="Preferences & account" />

      <div className="mx-auto max-w-lg space-y-4 p-4">
        <Card>
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'User'}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent font-medium">
                {(user?.displayName ?? 'U')[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text-primary truncate">
                {user?.displayName ?? 'User'}
              </p>
              <p className="text-sm text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
        </Card>

        <Card>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated">
                {isDark ? (
                  <Moon className="h-4 w-4 text-text-secondary" />
                ) : (
                  <Sun className="h-4 w-4 text-text-secondary" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">
                  {isDark ? 'Dark mode' : 'Light mode'}
                </p>
                <p className="text-xs text-text-muted">Tap to switch theme</p>
              </div>
            </div>
            <div
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                isDark ? 'bg-accent' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                  isDark ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </div>
          </button>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-medium text-text-primary">Data management</p>

          <Button
            variant="secondary"
            className="w-full"
            loading={exporting}
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export database JSON
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            loading={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
          />

          <Button
            variant="danger"
            className="w-full"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete all data
          </Button>
        </Card>

        <Button
          variant="danger"
          className="w-full"
          onClick={handleLogout}
          loading={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete all data"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will permanently delete all your projects, tasks, and daily logs.
            Export a backup first if you need one. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDeleteAll}>
              Delete everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function getDateKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
