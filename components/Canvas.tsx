import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Stage, Layer, Line, Rect, Circle } from "react-konva"
import type Konva from "konva"

interface CanvasProps {
  width: number
  height: number
  lines: any[]
  setLines: React.Dispatch<React.SetStateAction<any[]>>
  selectedTool: string
  brushSize: number
  brushColor: string
  selectedLayer: string
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  lines,
  setLines,
  selectedTool,
  brushSize,
  brushColor,
  selectedLayer,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [shapes, setShapes] = useState<any[]>([])

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
    [selectedTool, brushColor, brushSize, selectedLayer, setLines],
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
    [isDrawing, selectedTool, setLines],
  )

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  useEffect(() => {
    const checkCanvas = () => {
      const stage = stageRef.current
      if (stage) {
        const canvas = stage.canvas
        if (canvas) {
          canvas.style.width = "100%"
          canvas.style.height = "100%"
        }
      }
    }

    checkCanvas()
    const timeoutId = setTimeout(checkCanvas, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      ref={stageRef}
      className="border border-gray-300 rounded-lg shadow-lg bg-white"
    >
      <Layer>
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
            return <Rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.color} />
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
  )
}

export default Canvas

