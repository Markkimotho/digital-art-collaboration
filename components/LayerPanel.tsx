import type React from "react"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, Eye, EyeOff, Trash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Layer {
  id: string
  name: string
  locked: boolean
  visible: boolean
}

interface LayerPanelProps {
  layers: Layer[]
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
  selectedLayer: string
  setSelectedLayer: React.Dispatch<React.SetStateAction<string>>
}

const LayerPanel: React.FC<LayerPanelProps> = ({ layers, setLayers, selectedLayer, setSelectedLayer }) => {
  const toggleLock = (id: string) => {
    setLayers(layers.map((layer) => (layer.id === id ? { ...layer, locked: !layer.locked } : layer)))
  }

  const toggleVisibility = (id: string) => {
    setLayers(layers.map((layer) => (layer.id === id ? { ...layer, visible: !layer.visible } : layer)))
  }

  const deleteLayer = (id: string) => {
    setLayers(layers.filter((layer) => layer.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Layers</CardTitle>
      </CardHeader>
      <CardContent>
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center justify-between mb-2 p-2 rounded ${selectedLayer === layer.id ? "bg-blue-100" : ""}`}
            onClick={() => setSelectedLayer(layer.id)}
          >
            <span>{layer.name}</span>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => toggleLock(layer.id)}>
                {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toggleVisibility(layer.id)}>
                {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteLayer(layer.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          className="w-full mt-4"
          onClick={() =>
            setLayers([
              ...layers,
              { id: Date.now().toString(), name: `Layer ${layers.length + 1}`, locked: false, visible: true },
            ])
          }
        >
          Add Layer
        </Button>
      </CardContent>
    </Card>
  )
}

export default LayerPanel

