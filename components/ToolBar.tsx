import type React from "react"
import { Brush, Eraser, Square, Circle, Type, Image, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ToolBarProps {
  selectedTool: string
  setSelectedTool: React.Dispatch<React.SetStateAction<string>>
  brushSize: number
  setBrushSize: React.Dispatch<React.SetStateAction<number>>
  brushColor: string
  setBrushColor: React.Dispatch<React.SetStateAction<string>>
}

const ToolBar: React.FC<ToolBarProps> = ({
  selectedTool,
  setSelectedTool,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 p-4 bg-white shadow-md rounded-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === "brush" ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedTool("brush")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Brush className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Brush</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === "eraser" ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedTool("eraser")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eraser</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === "rectangle" ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedTool("rectangle")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rectangle</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === "circle" ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedTool("circle")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Circle</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === "line" ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedTool("line")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Line</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === "text" ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedTool("text")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Text</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedTool === "image" ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedTool("image")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <Image className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Image</p>
          </TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[80px] bg-gray-100 hover:bg-gray-200 text-gray-800">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: brushColor }}></div>
              Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] bg-white/10 border-white/20">
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-full h-8"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[80px] bg-gray-100 hover:bg-gray-200 text-gray-800">
              Size: {brushSize}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] bg-white/10 border-white/20">
            <Slider
              min={1}
              max={50}
              step={1}
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              className="mt-2"
            />
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}

export default ToolBar

