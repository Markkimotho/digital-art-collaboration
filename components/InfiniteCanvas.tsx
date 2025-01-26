"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { Stage, Layer, Line, Rect, Circle } from "react-konva"
import type Konva from "konva"
import { motion } from "framer-motion"

interface InfiniteCanvasProps {
  selectedTool: string
  brushSize: number
  brushColor: string
  selectedLayer: string
}

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ selectedTool, brushSize, brushColor, selectedLayer }) => {
  const stageRef = useRef<Konva.Stage | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [lines, setLines] = useState<any[]>([])
  const [shapes, setShapes] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [stageSize, setStageSize] = useState({ width: 1000, height: 1000 })

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const scaleBy = 1.1
      const stage = stageRef.current
      if (stage) {
        const oldScale = scale
        const pointerPos = stage.getPointerPosition()
        if (pointerPos) {
          const mousePointTo = {
            x: (pointerPos.x - stage.x()) / oldScale,
            y: (pointerPos.y - stage.y()) / oldScale,
          }
          const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
          setScale(newScale)
          setPosition({
            x: pointerPos.x - mousePointTo.x * newScale,
            y: pointerPos.y - mousePointTo.y * newScale,
          })
        }
      }
    },
    [scale],
  )

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      setIsDrawing(true)
      const pos = e.target.getStage()?.getPointerPosition()
      if (pos) {
        if (selectedTool === "brush" || selectedTool === "eraser") {
          setLines((prevLines) => [
            ...prevLines,
            { tool: selectedTool, points: [pos.x, pos.y], color: brushColor, size: brushSize, layer: selectedLayer },
          ])
        } else if (selectedTool === "rectangle" || selectedTool === "circle") {
          setShapes((prevShapes) => [
            ...prevShapes,
            { tool: selectedTool, x: pos.x, y: pos.y, width: 0, height: 0, color: brushColor, layer: selectedLayer },
          ])
        }
      }
    },
    [selectedTool, brushColor, brushSize, selectedLayer],
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawing) return

      const stage = e.target.getStage()
      const point = stage?.getPointerPosition()
      if (point) {
        if (selectedTool === "brush" || selectedTool === "eraser") {
          setLines((prevLines) => {
            const lastLine = prevLines[prevLines.length - 1]
            const newLastLine = {
              ...lastLine,
              points: lastLine.points.concat([point.x, point.y]),
            }
            return [...prevLines.slice(0, -1), newLastLine]
          })
        } else if (selectedTool === "rectangle" || selectedTool === "circle") {
          setShapes((prevShapes) => {
            const lastShape = prevShapes[prevShapes.length - 1]
            const newLastShape = {
              ...lastShape,
              width: point.x - lastShape.x,
              height: point.y - lastShape.y,
            }
            return [...prevShapes.slice(0, -1), newLastShape]
          })
        }
      }
    },
    [isDrawing, selectedTool],
  )

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setPosition({ x: e.target.x(), y: e.target.y() })
  }, [])

  useEffect(() => {
    const checkSize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    checkSize()
    window.addEventListener("resize", checkSize)

    return () => window.removeEventListener("resize", checkSize)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onDragEnd={handleDragEnd}
        draggable
      >
        <Layer>
          <Rect x={-5000} y={-5000} width={10000} height={10000} fill="#f0f0f0" />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
            />
          ))}
          {shapes.map((shape, i) => {
            if (shape.tool === "rectangle") {
              return (
                <Rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.color} />
              )
            } else if (shape.tool === "circle") {
              return (
                <Circle
                  key={i}
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  radius={Math.max(Math.abs(shape.width), Math.abs(shape.height)) / 2}
                  fill={shape.color}
                />
              )
            }
            return null
          })}
        </Layer>
      </Stage>
    </motion.div>
  )
}

export default InfiniteCanvas

