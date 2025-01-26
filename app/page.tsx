"use client"

import React, { useState } from "react"
import InfiniteCanvas from "../components/InfiniteCanvas"
import ToolBar from "../components/ToolBar"
import CollapsibleSidebar from "../components/CollapsibleSidebar"
import HamburgerMenu from "../components/HamburgerMenu"
import { motion } from "framer-motion"

export default function Home() {
  const [selectedTool, setSelectedTool] = useState("brush")
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState("#3B82F6")
  const [layers, setLayers] = useState([{ id: "1", name: "Layer 1", locked: false, visible: true }])
  const [selectedLayer, setSelectedLayer] = useState("1")
  const [versions, setVersions] = useState<{ id: string; timestamp: number; description: string }[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [comments, setComments] = useState<{ id: string; text: string; author: string; timestamp: number }[]>([])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen bg-background text-foreground overflow-hidden"
    >
      <HamburgerMenu />
      <div className="flex flex-col flex-1">
        <ToolBar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
        />
        <div className="flex-1 overflow-hidden">
          <InfiniteCanvas
            selectedTool={selectedTool}
            brushSize={brushSize}
            brushColor={brushColor}
            selectedLayer={selectedLayer}
          />
        </div>
      </div>
      <CollapsibleSidebar
        layers={layers}
        setLayers={setLayers}
        selectedLayer={selectedLayer}
        setSelectedLayer={setSelectedLayer}
        versions={versions}
        setVersions={setVersions}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
        comments={comments}
        setComments={setComments}
      />
    </motion.div>
  )
}

