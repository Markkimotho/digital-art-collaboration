'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Line, Rect, Circle, Text, Circle as KonvaCircle, Shape } from 'react-konva'
import { motion, AnimatePresence } from 'framer-motion'
import { Crosshair } from 'lucide-react'
import type Konva from 'konva'
import type {
  CanvasElement, StrokeData, ShapeData, TextData,
  LayerData, CursorData, CanvasType, GridType, DrawTool,
} from '@/types/canvas'
import { CANVAS_TYPE_CONFIG } from '@/types/canvas'

interface InfiniteCanvasProps {
  selectedTool: string
  brushSize: number
  brushColor: string
  fontSize: number
  selectedLayer: string
  canvasElements: CanvasElement[]
  setCanvasElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>
  cursors: CursorData[]
  onStrokeStart: (stroke: StrokeData) => void
  onStrokeUpdate: (strokeId: string, points: number[], pressures?: number[]) => void
  onStrokeEnd: (stroke: StrokeData) => void
  onShapeAdd: (shape: ShapeData) => void
  onTextAdd: (text: TextData) => void
  onElementMove: (elementId: string, offsetX: number, offsetY: number) => void
  onCursorMove: (x: number, y: number) => void
  layers: LayerData[]
  canvasType: CanvasType
  gridType: GridType
}

// ── Cursor colors ────────────────────────────────────────────────────────────
const CURSOR_COLORS = ['#4f7df3', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#f97316']
function getCursorColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return CURSOR_COLORS[Math.abs(h) % CURSOR_COLORS.length]
}

// ── Grid overlay ─────────────────────────────────────────────────────────────
function GridOverlay({ scale, position, stageSize, gridType, dark }: {
  scale: number; position: { x: number; y: number }
  stageSize: { width: number; height: number }; gridType: GridType; dark: boolean
}) {
  if (gridType === 'none') return null
  let spacing = 50
  if (scale < 0.4) spacing = 200
  else if (scale < 0.8) spacing = 100
  else if (scale > 4) spacing = 20
  const buf = spacing * 2
  const left   = -position.x / scale - buf
  const right  = -position.x / scale + stageSize.width  / scale + buf
  const top    = -position.y / scale - buf
  const bottom = -position.y / scale + stageSize.height / scale + buf
  const lineColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(80,55,20,0.14)'
  const dotColor  = dark ? 'rgba(255,255,255,0.22)' : 'rgba(80,55,20,0.32)'
  const startX = Math.floor(left  / spacing) * spacing
  const startY = Math.floor(top   / spacing) * spacing
  const els: JSX.Element[] = []
  if (gridType === 'lines' || gridType === 'grid') {
    for (let y = startY; y <= bottom; y += spacing)
      els.push(<Line key={`h${y}`} points={[left, y, right, y]} stroke={lineColor} strokeWidth={1 / scale} listening={false} />)
  }
  if (gridType === 'grid') {
    for (let x = startX; x <= right; x += spacing)
      els.push(<Line key={`v${x}`} points={[x, top, x, bottom]} stroke={lineColor} strokeWidth={1 / scale} listening={false} />)
  }
  if (gridType === 'dotgrid') {
    for (let y = startY; y <= bottom; y += spacing)
      for (let x = startX; x <= right; x += spacing)
        els.push(<KonvaCircle key={`d${x},${y}`} x={x} y={y} radius={1.5 / scale} fill={dotColor} listening={false} />)
  }
  return <Layer listening={false}>{els}</Layer>
}

// ── Pressure / calligraphy ribbon renderer ───────────────────────────────────
function RibbonStroke({ stroke }: { stroke: StrokeData }) {
  const pts = stroke.points
  const pressures = stroke.pressures
  const nibAngle = stroke.tiltAngle ?? Math.PI / 4

  return (
    <Shape
      x={stroke.offsetX ?? 0}
      y={stroke.offsetY ?? 0}
      listening={false}
      sceneFunc={(ctx) => {
        if (pts.length < 4) return
        ctx.globalAlpha = stroke.opacity ?? 1

        for (let i = 0; i < pts.length - 2; i += 2) {
          const x1 = pts[i],     y1 = pts[i + 1]
          const x2 = pts[i + 2], y2 = pts[i + 3]
          const dx = x2 - x1, dy = y2 - y1
          const len = Math.hypot(dx, dy)
          if (len < 0.3) continue

          let w1: number, w2: number

          if (pressures && pressures.length > i / 2 + 1) {
            // Pressure-sensitive: width driven by stylus pressure
            const p1 = Math.max(0.05, pressures[i / 2]       ?? 0.5)
            const p2 = Math.max(0.05, pressures[i / 2 + 1]   ?? 0.5)
            w1 = stroke.size * p1 * 2.2
            w2 = stroke.size * p2 * 2.2
          } else {
            // Calligraphy: width driven by stroke angle vs nib angle
            const strokeAngle = Math.atan2(dy, dx)
            const diff = strokeAngle - nibAngle
            const factor = 0.15 + 0.85 * Math.abs(Math.sin(diff * 2))
            w1 = w2 = Math.max(0.5, stroke.size * factor)
          }

          const nx = -dy / len, ny = dx / len
          ctx.beginPath()
          ctx.fillStyle = stroke.color
          ctx.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2)
          ctx.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2)
          ctx.lineTo(x2 - nx * w2 / 2, y2 - ny * w2 / 2)
          ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2)
          ctx.closePath()
          ctx.fill()
        }
      }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  selectedTool, brushSize, brushColor, fontSize, selectedLayer,
  canvasElements, setCanvasElements,
  cursors, onStrokeStart, onStrokeUpdate, onStrokeEnd,
  onShapeAdd, onTextAdd, onElementMove, onCursorMove,
  layers, canvasType, gridType,
}) => {
  const stageRef    = useRef<Konva.Stage | null>(null)
  const wrapperRef  = useRef<HTMLDivElement | null>(null)
  const [scale, setScale]         = useState(1)
  const [position, setPosition]   = useState({ x: 0, y: 0 })
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })

  // Mutable refs that shadow props — safe to read inside pointer event callbacks
  const toolRef       = useRef(selectedTool)
  const colorRef      = useRef(brushColor)
  const sizeRef       = useRef(brushSize)
  const layerRef      = useRef(selectedLayer)
  const fontSizeRef   = useRef(fontSize)
  const scaleRef      = useRef(scale)
  const positionRef   = useRef(position)
  useEffect(() => { toolRef.current     = selectedTool },  [selectedTool])
  useEffect(() => { colorRef.current    = brushColor },    [brushColor])
  useEffect(() => { sizeRef.current     = brushSize },     [brushSize])
  useEffect(() => { layerRef.current    = selectedLayer }, [selectedLayer])
  useEffect(() => { fontSizeRef.current = fontSize },      [fontSize])
  useEffect(() => { scaleRef.current    = scale },         [scale])
  useEffect(() => { positionRef.current = position },      [position])

  // Drawing state refs
  const currentStrokeRef      = useRef<StrokeData | null>(null)
  const currentPressuresRef   = useRef<number[]>([])
  const currentShapeStartRef  = useRef<{ x: number; y: number } | null>(null)
  const currentShapeIdRef     = useRef<string | null>(null)
  const lineStartRef          = useRef<{ x: number; y: number } | null>(null)
  const isDrawingRef          = useRef(false)

  // Pointer tracking for multi-touch pinch-zoom and palm rejection
  const activePointersRef  = useRef<Map<number, { x: number; y: number; type: string }>>(new Map())
  const lastPinchDistRef   = useRef<number | null>(null)
  const lastPinchMidRef    = useRef<{ x: number; y: number } | null>(null)
  const penActiveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPenActiveRef     = useRef(false)  // palm rejection flag
  const isPanningRef       = useRef(false)  // panning with hand tool / 2 fingers
  const panStartPosRef     = useRef<{ x: number; y: number } | null>(null)
  const panStartStageRef   = useRef<{ x: number; y: number } | null>(null)
  const lastCursorEmitRef  = useRef(0)

  // Pending text input
  const [pendingText, setPendingText] = useState<{ viewX: number; viewY: number; worldX: number; worldY: number } | null>(null)
  const [textValue, setTextValue]     = useState('')
  const textInputRef = useRef<HTMLTextAreaElement | null>(null)

  const config = CANVAS_TYPE_CONFIG[canvasType]
  const isDark = config.dark

  // ── Stage size ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => setStageSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Focus text input when shown
  useEffect(() => {
    if (pendingText) setTimeout(() => textInputRef.current?.focus(), 30)
  }, [pendingText])

  // ── Coordinate helpers ──────────────────────────────────────────────────────
  const toWorld = useCallback((vx: number, vy: number) => ({
    x: (vx - positionRef.current.x) / scaleRef.current,
    y: (vy - positionRef.current.y) / scaleRef.current,
  }), [])

  const containerRect = useCallback(() =>
    stageRef.current?.container().getBoundingClientRect() ?? null
  , [])

  const eventToViewport = useCallback((cx: number, cy: number) => {
    const r = containerRect()
    if (!r) return { x: cx, y: cy }
    return { x: cx - r.left, y: cy - r.top }
  }, [containerRect])

  // ── Tool helpers ─────────────────────────────────────────────────────────────
  const isStrokeTool = (t: string) =>
    ['brush', 'pencil', 'pen', 'calligraphy', 'eraser', 'line'].includes(t)

  const strokeOpacity = (t: string) => t === 'pencil' ? 0.72 : 1
  const strokeSizeMultiplier = (t: string) => t === 'pen' ? 0.6 : t === 'pencil' ? 0.8 : 1
  const usesPressure = (t: string) => ['brush', 'pencil', 'eraser'].includes(t)
  const usesRibbon   = (t: string) => ['calligraphy'].includes(t) || usesPressure(t)

  // ── Stroke start ─────────────────────────────────────────────────────────────
  const startStroke = useCallback((
    vx: number, vy: number, pressure: number,
    tiltX = 0, tiltY = 0, pointerType = 'mouse'
  ) => {
    const tool  = toolRef.current
    const world = toWorld(vx, vy)

    if (tool === 'text') {
      setPendingText({ viewX: vx, viewY: vy, worldX: world.x, worldY: world.y })
      setTextValue('')
      return
    }

    if (isStrokeTool(tool)) {
      // Nib angle from stylus tilt (falls back to 45° for non-stylus)
      const nibAngle = pointerType === 'pen'
        ? Math.atan2(tiltY, tiltX)
        : Math.PI / 4

      const initPts = tool === 'line'
        ? [world.x, world.y, world.x, world.y]
        : [world.x, world.y]

      const stroke: StrokeData = {
        id: crypto.randomUUID(), type: 'stroke',
        tool: tool as DrawTool,
        points: initPts,
        pressures: (pointerType === 'pen' && usesPressure(tool)) ? [pressure] : undefined,
        tiltAngle: tool === 'calligraphy' ? nibAngle : undefined,
        color: colorRef.current,
        size: sizeRef.current * strokeSizeMultiplier(tool),
        layerId: layerRef.current,
        opacity: strokeOpacity(tool),
      }
      currentStrokeRef.current  = stroke
      currentPressuresRef.current = [pressure]
      if (tool === 'line') lineStartRef.current = world
      setCanvasElements(prev => [...prev, stroke])
      onStrokeStart(stroke)
      isDrawingRef.current = true
    } else if (tool === 'rectangle' || tool === 'circle') {
      const id = crypto.randomUUID()
      currentShapeIdRef.current   = id
      currentShapeStartRef.current = world
      const shape: ShapeData = {
        id, type: 'shape', tool: tool as 'rectangle' | 'circle',
        x: world.x, y: world.y, width: 0, height: 0,
        color: colorRef.current, layerId: layerRef.current,
      }
      setCanvasElements(prev => [...prev, shape])
      isDrawingRef.current = true
    }
  }, [toWorld, setCanvasElements, onStrokeStart])

  // ── Stroke update ─────────────────────────────────────────────────────────────
  const updateStroke = useCallback((vx: number, vy: number, pressure: number) => {
    const world = toWorld(vx, vy)

    // Throttled cursor broadcast
    const now = Date.now()
    if (now - lastCursorEmitRef.current > 33) {
      onCursorMove(world.x, world.y)
      lastCursorEmitRef.current = now
    }

    if (!isDrawingRef.current) return

    if (currentStrokeRef.current) {
      const stroke  = currentStrokeRef.current
      currentPressuresRef.current.push(pressure)
      let newPoints: number[]

      if (stroke.tool === 'line' && lineStartRef.current) {
        newPoints = [lineStartRef.current.x, lineStartRef.current.y, world.x, world.y]
      } else {
        newPoints = [...stroke.points, world.x, world.y]
      }

      const newPressures = stroke.pressures ? [...currentPressuresRef.current] : undefined
      const updated: StrokeData = { ...stroke, points: newPoints, pressures: newPressures }
      currentStrokeRef.current = updated

      setCanvasElements(prev =>
        prev.map(el => el.id === stroke.id ? updated : el)
      )
      onStrokeUpdate(stroke.id, newPoints, newPressures)
    } else if (currentShapeIdRef.current && currentShapeStartRef.current) {
      const start = currentShapeStartRef.current
      setCanvasElements(prev =>
        prev.map(el =>
          el.id === currentShapeIdRef.current
            ? { ...el, width: world.x - start.x, height: world.y - start.y } as ShapeData
            : el
        )
      )
    }
  }, [toWorld, onCursorMove, setCanvasElements, onStrokeUpdate])

  // ── Stroke end ───────────────────────────────────────────────────────────────
  const endStroke = useCallback(() => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    lineStartRef.current = null

    if (currentStrokeRef.current) {
      const stroke = currentStrokeRef.current
      currentStrokeRef.current    = null
      currentPressuresRef.current = []
      onStrokeEnd(stroke)
    } else if (currentShapeIdRef.current) {
      const shapeId = currentShapeIdRef.current
      currentShapeIdRef.current    = null
      currentShapeStartRef.current = null
      setCanvasElements(prev => {
        const shape = prev.find(el => el.id === shapeId) as ShapeData | undefined
        if (shape) onShapeAdd(shape)
        return prev
      })
    }
  }, [onStrokeEnd, onShapeAdd, setCanvasElements])

  // ── Pointer event handler (unified mouse + touch + pen) ──────────────────────
  useEffect(() => {
    const el = stageRef.current?.container()
    if (!el) return

    // ── Pan helpers ─────────────────────────────────────────────────────────
    const startPan = (cx: number, cy: number) => {
      isPanningRef.current    = true
      panStartPosRef.current  = { x: cx, y: cy }
      panStartStageRef.current = { ...positionRef.current }
    }
    const movePan = (cx: number, cy: number) => {
      if (!panStartPosRef.current || !panStartStageRef.current) return
      setPosition({
        x: panStartStageRef.current.x + (cx - panStartPosRef.current.x),
        y: panStartStageRef.current.y + (cy - panStartPosRef.current.y),
      })
    }
    const endPan = () => {
      isPanningRef.current     = false
      panStartPosRef.current   = null
      panStartStageRef.current = null
    }

    // ── Pinch helpers ───────────────────────────────────────────────────────
    const getPinchInfo = () => {
      const pts = Array.from(activePointersRef.current.values())
      if (pts.length < 2) return null
      const [a, b] = pts
      return {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      }
    }

    // ── pointerdown ─────────────────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      // Palm rejection: if pen is active, ignore all touch input
      if (e.pointerType === 'touch' && isPenActiveRef.current) {
        e.preventDefault()
        return
      }

      e.preventDefault()

      // Mark pen as active (persists 500ms after last pen event to reject palms)
      if (e.pointerType === 'pen') {
        isPenActiveRef.current = true
        if (penActiveTimerRef.current) clearTimeout(penActiveTimerRef.current)
        penActiveTimerRef.current = setTimeout(() => {
          isPenActiveRef.current = false
        }, 500)
      }

      const vp = eventToViewport(e.clientX, e.clientY)
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType })

      const tool = toolRef.current
      const touchCount = Array.from(activePointersRef.current.values())
        .filter(p => p.type === 'touch').length

      // Two-finger touch → switch to pinch/pan regardless of tool
      if (touchCount >= 2) {
        if (isDrawingRef.current) endStroke()
        isPanningRef.current = false
        const pinch = getPinchInfo()
        if (pinch) {
          lastPinchDistRef.current = pinch.dist
          lastPinchMidRef.current  = pinch.mid
        }
        return
      }

      if (tool === 'hand') {
        el.setPointerCapture(e.pointerId)
        startPan(e.clientX, e.clientY)
      } else if (tool !== 'select') {
        el.setPointerCapture(e.pointerId)
        startStroke(vp.x, vp.y, e.pressure || 0.5, e.tiltX, e.tiltY, e.pointerType)
      }
    }

    // ── pointermove ─────────────────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && isPenActiveRef.current) return
      e.preventDefault()

      // Refresh pen-active timer
      if (e.pointerType === 'pen') {
        isPenActiveRef.current = true
        if (penActiveTimerRef.current) clearTimeout(penActiveTimerRef.current)
        penActiveTimerRef.current = setTimeout(() => { isPenActiveRef.current = false }, 500)
      }

      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType })

      const touchCount = Array.from(activePointersRef.current.values())
        .filter(p => p.type === 'touch').length

      // Pinch-zoom gesture (2 fingers)
      if (touchCount >= 2 && lastPinchDistRef.current !== null && lastPinchMidRef.current !== null) {
        const pinch = getPinchInfo()
        if (!pinch) return
        const scaleFactor = pinch.dist / lastPinchDistRef.current
        const newScale = Math.max(0.05, Math.min(20, scaleRef.current * scaleFactor))
        const r = el.getBoundingClientRect()
        const midVx = pinch.mid.x - r.left
        const midVy = pinch.mid.y - r.top
        const worldAtMid = {
          x: (midVx - positionRef.current.x) / scaleRef.current,
          y: (midVy - positionRef.current.y) / scaleRef.current,
        }
        const newPos = {
          x: midVx - worldAtMid.x * newScale,
          y: midVy - worldAtMid.y * newScale,
        }
        setScale(newScale)
        setPosition(newPos)
        lastPinchDistRef.current = pinch.dist
        lastPinchMidRef.current  = pinch.mid
        return
      }

      if (isPanningRef.current) {
        movePan(e.clientX, e.clientY)
        return
      }

      const vp = eventToViewport(e.clientX, e.clientY)
      updateStroke(vp.x, vp.y, e.pressure || 0.5)
    }

    // ── pointerup / pointercancel ───────────────────────────────────────────
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && isPenActiveRef.current) {
        activePointersRef.current.delete(e.pointerId)
        return
      }
      e.preventDefault()
      activePointersRef.current.delete(e.pointerId)

      const touchCount = Array.from(activePointersRef.current.values())
        .filter(p => p.type === 'touch').length

      if (touchCount < 2) {
        lastPinchDistRef.current = null
        lastPinchMidRef.current  = null
      }

      if (isPanningRef.current && touchCount === 0) {
        endPan()
        return
      }

      if (activePointersRef.current.size === 0 || e.pointerType === 'pen') {
        endStroke()
      }
    }

    el.addEventListener('pointerdown',   onDown,  { passive: false })
    el.addEventListener('pointermove',   onMove,  { passive: false })
    el.addEventListener('pointerup',     onUp,    { passive: false })
    el.addEventListener('pointercancel', onUp,    { passive: false })

    return () => {
      el.removeEventListener('pointerdown',   onDown)
      el.removeEventListener('pointermove',   onMove)
      el.removeEventListener('pointerup',     onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [startStroke, updateStroke, endStroke, eventToViewport])

  // ── Wheel zoom ───────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const oldScale = scale
    const pointer  = stage.getPointerPosition()
    if (!pointer) return
    const scaleBy  = 1.08
    const newScale = Math.max(0.05, Math.min(20,
      e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    ))
    const mp = { x: (pointer.x - position.x) / oldScale, y: (pointer.y - position.y) / oldScale }
    setScale(newScale)
    setPosition({ x: pointer.x - mp.x * newScale, y: pointer.y - mp.y * newScale })
  }, [scale, position])

  // ── Reset / find content ─────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    const pts: number[] = []
    canvasElements.forEach(el => {
      if (el.type === 'stroke') {
        const s = el as StrokeData
        const ox = s.offsetX ?? 0, oy = s.offsetY ?? 0
        for (let i = 0; i < s.points.length - 1; i += 2)
          pts.push(s.points[i] + ox, s.points[i + 1] + oy)
      } else if (el.type === 'shape') {
        const sh = el as ShapeData
        pts.push(sh.x + (sh.offsetX ?? 0), sh.y + (sh.offsetY ?? 0))
        pts.push(sh.x + sh.width + (sh.offsetX ?? 0), sh.y + sh.height + (sh.offsetY ?? 0))
      } else if (el.type === 'text') {
        const t = el as TextData
        pts.push(t.x + (t.offsetX ?? 0), t.y + (t.offsetY ?? 0))
      }
    })
    if (pts.length === 0) { setScale(1); setPosition({ x: 0, y: 0 }); return }
    const xs = pts.filter((_, i) => i % 2 === 0)
    const ys = pts.filter((_, i) => i % 2 === 1)
    const pad = 80
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const cW = maxX - minX + pad * 2, cH = maxY - minY + pad * 2
    const s  = Math.min(stageSize.width / cW, stageSize.height / cH, 3)
    setScale(s)
    setPosition({
      x: (stageSize.width  - cW * s) / 2 - (minX - pad) * s,
      y: (stageSize.height - cH * s) / 2 - (minY - pad) * s,
    })
  }, [canvasElements, stageSize])

  // ── Text commit ──────────────────────────────────────────────────────────────
  const commitText = useCallback(() => {
    if (!pendingText || !textValue.trim()) { setPendingText(null); setTextValue(''); return }
    const textEl: TextData = {
      id: crypto.randomUUID(), type: 'text',
      x: pendingText.worldX, y: pendingText.worldY,
      text: textValue.trim(), fontSize: fontSizeRef.current,
      color: colorRef.current, fontFamily: 'serif',
      layerId: layerRef.current,
    }
    setCanvasElements(prev => [...prev, textEl])
    onTextAdd(textEl)
    setPendingText(null)
    setTextValue('')
  }, [pendingText, textValue, setCanvasElements, onTextAdd])

  // ── Cursor style ─────────────────────────────────────────────────────────────
  const cursor =
    selectedTool === 'hand'   ? 'grab' :
    selectedTool === 'eraser' ? 'cell' :
    selectedTool === 'text'   ? 'text' :
    selectedTool === 'select' ? 'default' : 'crosshair'

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapperRef}
      className={`w-full h-full touch-none select-none relative overflow-hidden ${isDark ? 'paper-grain-dark' : 'paper-grain paper-vignette'}`}
      style={{ backgroundColor: config.bg, cursor }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        // All drawing handled by native pointer events above; Stage only needs wheel
        listening={true}
      >
        <GridOverlay scale={scale} position={position} stageSize={stageSize} gridType={gridType} dark={isDark} />

        {layers.map((layer) => {
          if (!layer.visible) return null
          const elements = canvasElements.filter(el => el.layerId === layer.id)
          return (
            <Layer key={layer.id} listening={selectedTool === 'select' && !layer.locked}>
              {elements.map((el) => {
                if (el.type === 'stroke') {
                  const s = el as StrokeData
                  // Ribbon renderer for calligraphy and pressure-sensitive strokes
                  if (s.tool === 'calligraphy' || (s.pressures && s.pressures.length > 0)) {
                    return (
                      <RibbonStroke key={s.id} stroke={s} />
                    )
                  }
                  return (
                    <Line
                      key={s.id}
                      x={s.offsetX ?? 0}
                      y={s.offsetY ?? 0}
                      points={s.points}
                      stroke={s.color}
                      strokeWidth={s.size}
                      opacity={s.opacity ?? 1}
                      tension={s.tool === 'pen' || s.tool === 'line' ? 0 : 0.4}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={s.tool === 'eraser' ? 'destination-out' : 'source-over'}
                      draggable={selectedTool === 'select' && !layer.locked}
                      onDragEnd={(e) => {
                        const ox = (s.offsetX ?? 0) + e.target.x()
                        const oy = (s.offsetY ?? 0) + e.target.y()
                        e.target.x(0); e.target.y(0)
                        setCanvasElements(prev =>
                          prev.map(el => el.id === s.id ? { ...el, offsetX: ox, offsetY: oy } as StrokeData : el)
                        )
                        onElementMove(s.id, ox, oy)
                      }}
                    />
                  )
                }
                if (el.type === 'shape') {
                  const sh = el as ShapeData
                  if (sh.tool === 'rectangle') {
                    return (
                      <Rect key={sh.id}
                        x={sh.x + (sh.offsetX ?? 0)} y={sh.y + (sh.offsetY ?? 0)}
                        width={sh.width} height={sh.height} fill={sh.color} cornerRadius={2}
                        draggable={selectedTool === 'select' && !layer.locked}
                        onDragEnd={(e) => {
                          const nx = sh.x + (sh.offsetX ?? 0) + e.target.x()
                          const ny = sh.y + (sh.offsetY ?? 0) + e.target.y()
                          e.target.x(0); e.target.y(0)
                          setCanvasElements(prev =>
                            prev.map(el => el.id === sh.id ? { ...el, x: nx, y: ny, offsetX: 0, offsetY: 0 } as ShapeData : el)
                          )
                          onElementMove(sh.id, 0, 0)
                        }}
                      />
                    )
                  }
                  if (sh.tool === 'circle') {
                    const r = Math.max(Math.abs(sh.width), Math.abs(sh.height)) / 2
                    return (
                      <KonvaCircle key={sh.id}
                        x={sh.x + sh.width / 2 + (sh.offsetX ?? 0)}
                        y={sh.y + sh.height / 2 + (sh.offsetY ?? 0)}
                        radius={r} fill={sh.color}
                        draggable={selectedTool === 'select' && !layer.locked}
                        onDragEnd={(e) => {
                          const cx = sh.x + sh.width / 2 + (sh.offsetX ?? 0) + e.target.x()
                          const cy = sh.y + sh.height / 2 + (sh.offsetY ?? 0) + e.target.y()
                          e.target.x(0); e.target.y(0)
                          setCanvasElements(prev =>
                            prev.map(el =>
                              el.id === sh.id
                                ? { ...el, x: cx - sh.width / 2, y: cy - sh.height / 2, offsetX: 0, offsetY: 0 } as ShapeData
                                : el
                            )
                          )
                          onElementMove(sh.id, 0, 0)
                        }}
                      />
                    )
                  }
                }
                if (el.type === 'text') {
                  const t = el as TextData
                  return (
                    <Text key={t.id}
                      x={t.x + (t.offsetX ?? 0)} y={t.y + (t.offsetY ?? 0)}
                      text={t.text} fontSize={t.fontSize}
                      fill={t.color} fontFamily={t.fontFamily ?? 'serif'}
                      draggable={selectedTool === 'select' && !layer.locked}
                      onDragEnd={(e) => {
                        const nx = t.x + (t.offsetX ?? 0) + e.target.x()
                        const ny = t.y + (t.offsetY ?? 0) + e.target.y()
                        e.target.x(0); e.target.y(0)
                        setCanvasElements(prev =>
                          prev.map(el => el.id === t.id ? { ...el, x: nx, y: ny, offsetX: 0, offsetY: 0 } as TextData : el)
                        )
                        onElementMove(t.id, 0, 0)
                      }}
                    />
                  )
                }
                return null
              })}
            </Layer>
          )
        })}

        {/* Remote cursors */}
        <Layer listening={false}>
          {cursors.map((c) => {
            const color = c.color || getCursorColor(c.userName)
            return (
              <React.Fragment key={c.userId || c.userName}>
                <KonvaCircle x={c.x} y={c.y} radius={5 / scale} fill={color} opacity={0.85}
                  stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} strokeWidth={1 / scale} />
                <Text x={c.x + 7 / scale} y={c.y - 7 / scale} text={c.userName}
                  fontSize={10 / scale} fill={isDark ? '#e8dcc8' : '#1a1410'}
                  fontStyle="bold"
                  shadowColor={isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
                  shadowBlur={3 / scale} shadowOffset={{ x: 0, y: 0 }} />
              </React.Fragment>
            )
          })}
        </Layer>
      </Stage>

      {/* Text input overlay */}
      <AnimatePresence>
        {pendingText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute z-10 pointer-events-auto"
            style={{ left: pendingText.viewX, top: pendingText.viewY }}
          >
            <textarea
              ref={textInputRef}
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText() }
                if (e.key === 'Escape') { setPendingText(null); setTextValue('') }
              }}
              onBlur={commitText}
              rows={1}
              placeholder="Type here…"
              className="min-w-[120px] max-w-[400px] bg-transparent border-0 outline-none resize-none leading-tight"
              style={{
                fontSize: `${fontSize * scale}px`,
                color: brushColor,
                fontFamily: 'Georgia, serif',
                caretColor: brushColor,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Find / reset view */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={resetView}
        title="Find content · reset view"
        className="absolute bottom-5 right-5 z-10 p-2.5 rounded-lg glass-strong shadow-lg text-white/45 hover:text-white/75 transition-colors"
      >
        <Crosshair className="h-4 w-4" strokeWidth={1.8} />
      </motion.button>
    </div>
  )
}

export default InfiniteCanvas
