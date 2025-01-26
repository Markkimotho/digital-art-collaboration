import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import LayerPanel from "./LayerPanel"
import VersionControl from "./VersionControl"
import FeedbackPanel from "./FeedbackPanel"
import { motion, AnimatePresence } from "framer-motion"

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
    <motion.div
      className={`fixed top-0 right-0 h-full transition-all duration-300 ease-in-out ${
        isOpen ? "w-80" : "w-12"
      } bg-card shadow-md text-foreground flex flex-col z-10`}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-2 transform -translate-x-full bg-card rounded-l-md p-2"
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="overflow-y-auto flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CollapsibleSidebar

