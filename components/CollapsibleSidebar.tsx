import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import LayerPanel from "./LayerPanel"
import VersionControl from "./VersionControl"
import FeedbackPanel from "./FeedbackPanel"

interface CollapsibleSidebarProps {
  layers: any[]
  setLayers: React.Dispatch<React.SetStateAction<any[]>>
  selectedLayer: string
  setSelectedLayer: React.Dispatch<React.SetStateAction<string>>
  versions: any[]
  setVersions: React.Dispatch<React.SetStateAction<any[]>>
  currentVersion: string | null
  setCurrentVersion: React.Dispatch<React.SetStateAction<string | null>>
  comments: any[]
  setComments: React.Dispatch<React.SetStateAction<any[]>>
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  layers,
  setLayers,
  selectedLayer,
  setSelectedLayer,
  versions,
  setVersions,
  currentVersion,
  setCurrentVersion,
  comments,
  setComments,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isOpen ? "w-80" : "w-12"
      } bg-white shadow-md text-gray-800 p-4 flex flex-col`}
    >
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="self-end mb-4">
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      {isOpen && (
        <>
          <LayerPanel
            layers={layers}
            setLayers={setLayers}
            selectedLayer={selectedLayer}
            setSelectedLayer={setSelectedLayer}
          />
          <VersionControl
            versions={versions}
            setVersions={setVersions}
            currentVersion={currentVersion}
            setCurrentVersion={setCurrentVersion}
          />
          <FeedbackPanel comments={comments} setComments={setComments} />
        </>
      )}
    </div>
  )
}

export default CollapsibleSidebar

