import type React from "react"
import { Brush, Eraser, Square, Circle, Type, Image, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

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
  const toolButtons = [
    { name: "brush", icon: Brush },
    { name: "eraser", icon: Eraser },
    { name: "rectangle", icon: Square },
    { name: "circle", icon: Circle },
    { name: "line", icon: Minus },
    { name: "text", icon: Type },
    { name: "image", icon: Image },
  ]

  return (
    <TooltipProvider>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-2 p-4 bg-card shadow-md rounded-lg m-4"
      >
        {toolButtons.map((tool) => (
          <Tooltip key={tool.name}>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTool === tool.name ? "default" : "outline"}
                size="icon"
                onClick={() => setSelectedTool(tool.name)}
                className={`bg-${selectedTool === tool.name ? "primary" : "card"} text-${selectedTool === tool.name ? "primary" : "card"}-foreground hover:bg-${selectedTool === tool.name ? "primary/90" : "card/90"}`}
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.name.charAt(0).toUpperCase() + tool.name.slice(1)}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[80px] bg-card hover:bg-card/90 text-foreground">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: brushColor }}></div>
              Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] bg-card border-border">
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
            <Button variant="outline" className="w-[80px] bg-card hover:bg-card/90 text-foreground">
              Size: {brushSize}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] bg-card border-border">
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
      </motion.div>
    </TooltipProvider>
  )
}

export default ToolBar

