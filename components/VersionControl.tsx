'use client'

import React, { useState } from 'react'
import { Save, RotateCcw, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { VersionData } from '@/types/canvas'

interface VersionControlProps {
  versions: VersionData[]
  onSaveVersion: (label: string) => void
  onRevertVersion: (versionId: string) => void
}

function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function VersionControl({ versions, onSaveVersion, onRevertVersion }: VersionControlProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [revertingId, setRevertingId] = useState<string | null>(null)

  const handleSave = () => {
    setIsSaving(true)
    const label = `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    onSaveVersion(label)
    setTimeout(() => setIsSaving(false), 800)
  }

  const handleRevert = (versionId: string) => {
    setRevertingId(versionId)
    onRevertVersion(versionId)
    setTimeout(() => setRevertingId(null), 800)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">History</span>
        <span className="text-xs text-white/25">{versions.length} saved</span>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={isSaving}
        className="
          w-full flex items-center justify-center gap-2
          py-2.5 px-3 rounded-xl
          bg-primary/15 hover:bg-primary/25 border border-primary/25
          text-primary text-sm font-medium
          transition-colors disabled:opacity-60
        "
      >
        <Save className="h-3.5 w-3.5" />
        {isSaving ? 'Saved!' : 'Save Snapshot'}
      </motion.button>

      <div className="flex flex-col gap-1 mt-1">
        <AnimatePresence initial={false}>
          {versions.map((version) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-2.5 rounded-xl border border-white/6 hover:border-white/10 hover:bg-white/4 group transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="h-3 w-3 text-white/30 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white/75 truncate">{version.label}</p>
                  <p className="text-xs text-white/30">{timeAgo(version.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => handleRevert(version.id)}
                disabled={revertingId === version.id}
                className="
                  ml-2 p-1.5 rounded-lg flex-shrink-0
                  text-white/30 hover:text-white/70 hover:bg-white/8
                  opacity-0 group-hover:opacity-100 transition-all
                  disabled:opacity-50
                "
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {versions.length === 0 && (
          <div className="text-center py-6 text-white/25 text-sm">
            No snapshots yet
          </div>
        )}
      </div>
    </div>
  )
}
