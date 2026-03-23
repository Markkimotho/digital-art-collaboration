'use client'

import React, { useState } from 'react'
import { ChevronRight, Layers, Clock, MessageSquare, PanelRightClose, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import LayerPanel from './LayerPanel'
import VersionControl from './VersionControl'
import FeedbackPanel from './FeedbackPanel'
import type { LayerData, VersionData, ChatMessage, CanvasType, GridType } from '@/types/canvas'
import { CANVAS_TYPE_CONFIG, GRID_TYPE_CONFIG } from '@/types/canvas'

interface CollapsibleSidebarProps {
  layers: LayerData[]
  selectedLayer: string
  setSelectedLayer: React.Dispatch<React.SetStateAction<string>>
  versions: VersionData[]
  chat: ChatMessage[]
  onLayerAdd: () => void
  onLayerUpdate: (layer: LayerData) => void
  onLayerDelete: (layerId: string) => void
  onSaveVersion: (label: string) => void
  onRevertVersion: (versionId: string) => void
  onSendMessage: (text: string) => void
  userName: string
  onOpenChange?: (open: boolean) => void
  canvasType: CanvasType
  setCanvasType: (t: CanvasType) => void
  gridType: GridType
  setGridType: (t: GridType) => void
}

export default function CollapsibleSidebar({
  layers, selectedLayer, setSelectedLayer,
  versions, chat,
  onLayerAdd, onLayerUpdate, onLayerDelete,
  onSaveVersion, onRevertVersion, onSendMessage,
  userName, onOpenChange,
  canvasType, setCanvasType, gridType, setGridType,
}: CollapsibleSidebarProps) {
  const [isOpen, setIsOpen]     = useState(false)
  const [activeTab, setActiveTab] = useState('layers')

  const toggle = (next: boolean) => {
    setIsOpen(next)
    onOpenChange?.(next)
  }

  const tabs = [
    { id: 'layers',   icon: Layers,       label: 'Layers'  },
    { id: 'versions', icon: Clock,        label: 'History' },
    { id: 'canvas',   icon: Settings,     label: 'Canvas'  },
    { id: 'chat',     icon: MessageSquare, label: 'Chat'   },
  ]

  return (
    <>
      {/* Toggle button */}
      <motion.button
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
        onClick={() => toggle(!isOpen)}
        className="
          fixed right-4 top-4 z-30
          p-2.5 rounded-lg glass-strong shadow-xl
          text-white/55 hover:text-white transition-colors
          min-w-[40px] min-h-[40px] flex items-center justify-center
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div animate={{ rotate: isOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <PanelRightClose className="h-4 w-4" strokeWidth={1.8} />
        </motion.div>
      </motion.button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggle(false)}
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-[85vw] md:w-80 glass-panel shadow-2xl flex flex-col"
            style={{ zIndex: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-white/6">
              <span className="rustic-label text-white/60">Panel</span>
              <button
                onClick={() => toggle(false)}
                className="p-1.5 rounded-md text-white/35 hover:text-white/65 hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
              <Tabs.List className="flex gap-0.5 px-2 py-2 border-b border-white/6">
                {tabs.map((tab) => (
                  <Tabs.Trigger
                    key={tab.id}
                    value={tab.id}
                    className="
                      relative flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium
                      transition-colors text-white/45 hover:text-white/65
                      data-[state=active]:text-white
                    "
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-md bg-white/8"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <tab.icon className="h-3 w-3 relative z-10" strokeWidth={1.8} />
                    <span className="relative z-10">{tab.label}</span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <Tabs.Content value="layers" className="p-3">
                  <LayerPanel
                    layers={layers}
                    selectedLayer={selectedLayer}
                    setSelectedLayer={setSelectedLayer}
                    onLayerAdd={onLayerAdd}
                    onLayerUpdate={onLayerUpdate}
                    onLayerDelete={onLayerDelete}
                  />
                </Tabs.Content>

                <Tabs.Content value="versions" className="p-3">
                  <VersionControl
                    versions={versions}
                    onSaveVersion={onSaveVersion}
                    onRevertVersion={onRevertVersion}
                  />
                </Tabs.Content>

                <Tabs.Content value="canvas" className="p-4 space-y-6">
                  <CanvasSettings
                    canvasType={canvasType} setCanvasType={setCanvasType}
                    gridType={gridType} setGridType={setGridType}
                  />
                </Tabs.Content>

                <Tabs.Content value="chat" className="p-3 h-full">
                  <FeedbackPanel
                    chat={chat}
                    onSendMessage={onSendMessage}
                    userName={userName}
                  />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Canvas Settings panel ────────────────────────────────────────────────────

function CanvasSettings({
  canvasType, setCanvasType, gridType, setGridType,
}: {
  canvasType: CanvasType
  setCanvasType: (t: CanvasType) => void
  gridType: GridType
  setGridType: (t: GridType) => void
}) {
  return (
    <div className="space-y-5">
      {/* Canvas surface */}
      <div>
        <p className="rustic-label text-white/40 mb-2.5">Surface</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(CANVAS_TYPE_CONFIG) as [CanvasType, { bg: string; label: string; dark: boolean }][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setCanvasType(key)}
              className={`
                relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all
                ${canvasType === key
                  ? 'border-primary/60 bg-primary/10'
                  : 'border-white/8 hover:border-white/16 bg-white/3'}
              `}
            >
              {/* Swatch */}
              <div
                className="w-full h-9 rounded-md shadow-inner relative overflow-hidden"
                style={{ backgroundColor: cfg.bg }}
              >
                {/* Mini grain overlay on swatch */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px',
                    mixBlendMode: cfg.dark ? 'screen' : 'multiply',
                  }}
                />
              </div>
              <span className="text-xs text-white/55 leading-tight text-center">{cfg.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid overlay */}
      <div>
        <p className="rustic-label text-white/40 mb-2.5">Grid</p>
        <div className="flex flex-col gap-1">
          {(Object.entries(GRID_TYPE_CONFIG) as [GridType, { label: string }][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setGridType(key)}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm text-left transition-all
                ${gridType === key
                  ? 'border-primary/60 bg-primary/10 text-white/85'
                  : 'border-transparent hover:border-white/10 hover:bg-white/4 text-white/50'}
              `}
            >
              <GridPreview type={key} />
              {cfg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function GridPreview({ type }: { type: GridType }) {
  const size = 20
  const s = 6 // spacing in preview
  const color = 'rgba(180,160,110,0.6)'

  if (type === 'none') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0 opacity-40">
        <rect width={size} height={size} rx={2} fill="rgba(180,160,110,0.15)" />
      </svg>
    )
  }
  if (type === 'lines') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <rect width={size} height={size} rx={2} fill="rgba(180,160,110,0.08)" />
        {[s, s*2, s*3].map(y => y < size && <line key={y} x1={0} y1={y} x2={size} y2={y} stroke={color} strokeWidth={0.8} />)}
      </svg>
    )
  }
  if (type === 'grid') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <rect width={size} height={size} rx={2} fill="rgba(180,160,110,0.08)" />
        {[s, s*2, s*3].map(y => y < size && <line key={`h${y}`} x1={0} y1={y} x2={size} y2={y} stroke={color} strokeWidth={0.8} />)}
        {[s, s*2, s*3].map(x => x < size && <line key={`v${x}`} x1={x} y1={0} x2={x} y2={size} stroke={color} strokeWidth={0.8} />)}
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <rect width={size} height={size} rx={2} fill="rgba(180,160,110,0.08)" />
      {[s, s*2, s*3].flatMap(y => y < size
        ? [s, s*2, s*3].map(x => x < size
          ? <circle key={`${x},${y}`} cx={x} cy={y} r={1} fill={color} />
          : null)
        : []
      )}
    </svg>
  )
}
