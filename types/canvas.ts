export type DrawTool = 'brush' | 'pencil' | 'pen' | 'calligraphy' | 'eraser' | 'line'
export type ShapeTool = 'rectangle' | 'circle'
export type UtilTool = 'text' | 'select' | 'hand'
export type CanvasTool = DrawTool | ShapeTool | UtilTool

export type CanvasType = 'plain' | 'kraft' | 'watercolor' | 'newsprint' | 'parchment' | 'blackboard'
export type GridType = 'none' | 'lines' | 'grid' | 'dotgrid'

export interface StrokeData {
  id: string
  type: 'stroke'
  tool: DrawTool
  points: number[]
  pressures?: number[]   // per-point pressure (0–1), present for pen/stylus input
  tiltAngle?: number     // nib angle in radians, used by calligraphy when stylus tilt is available
  color: string
  size: number
  layerId: string
  offsetX?: number
  offsetY?: number
  opacity?: number
  remote?: boolean
  pending?: boolean
}

export interface ShapeData {
  id: string
  type: 'shape'
  tool: ShapeTool
  x: number
  y: number
  width: number
  height: number
  color: string
  filled: boolean      // true = fill, false = stroke outline only
  strokeWidth: number  // used when filled = false
  layerId: string
  offsetX?: number
  offsetY?: number
}

export interface TextData {
  id: string
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
  color: string
  fontFamily: string
  layerId: string
  offsetX?: number
  offsetY?: number
}

export type CanvasElement = StrokeData | ShapeData | TextData

export interface LayerData {
  id: string
  name: string
  locked: boolean
  visible: boolean
  order: number
  roomId?: string
}

export interface VersionData {
  id: string
  label: string
  createdAt: string | Date
  roomId: string
}

export interface ChatMessage {
  id: string
  author: string
  text: string
  createdAt: string | Date
}

export interface CursorData {
  userName: string
  x: number
  y: number
  userId?: string
  color?: string
}

export const CANVAS_TYPE_CONFIG: Record<CanvasType, { bg: string; label: string; dark: boolean }> = {
  plain:      { bg: '#cfc09a', label: 'Aged Paper',    dark: false },
  kraft:      { bg: '#b5956a', label: 'Kraft Paper',   dark: false },
  watercolor: { bg: '#d0c8bc', label: 'Watercolour',   dark: false },
  newsprint:  { bg: '#c4bcaa', label: 'Newsprint',     dark: false },
  parchment:  { bg: '#d4b896', label: 'Old Parchment', dark: false },
  blackboard: { bg: '#1c2a1c', label: 'Blackboard',    dark: true  },
}

export const GRID_TYPE_CONFIG: Record<GridType, { label: string }> = {
  none:    { label: 'None' },
  lines:   { label: 'Ruled Lines' },
  grid:    { label: 'Grid' },
  dotgrid: { label: 'Dot Grid' },
}
