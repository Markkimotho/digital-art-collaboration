"use client"

import React, { useState } from "react"
import InfiniteCanvas from "../components/InfiniteCanvas"
import ToolBar from "../components/ToolBar"
import CollapsibleSidebar from "../components/CollapsibleSidebar"
import HamburgerMenu from "../components/HamburgerMenu"

export default function Home() {
  const [selectedTool, setSelectedTool] = useState("brush")
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState("#000000")
  const [layers, setLayers] = useState([{ id: "1", name: "Layer 1", locked: false, visible: true }])
  const [selectedLayer, setSelectedLayer] = useState("1")
  const [versions, setVersions] = useState<{ id: string; timestamp: number; description: string }[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [comments, setComments] = useState<{ id: string; text: string; author: string; timestamp: number }[]>([])

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
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
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
          <h1 className="text-2xl font-bold">Digital Art Collaboration</h1>
          <HamburgerMenu />
        </header>
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
    </div>
  )
}

