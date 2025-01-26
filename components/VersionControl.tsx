import type React from "react"
import { Button } from "@/components/ui/button"
import { Save, Undo } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Version {
  id: string
  timestamp: number
  description: string
}

interface VersionControlProps {
  versions: Version[]
  setVersions: React.Dispatch<React.SetStateAction<Version[]>>
  currentVersion: string | null
  setCurrentVersion: React.Dispatch<React.SetStateAction<string | null>>
}

const VersionControl: React.FC<VersionControlProps> = ({
  versions,
  setVersions,
  currentVersion,
  setCurrentVersion,
}) => {
  const saveVersion = () => {
    const newVersion = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      description: `Version ${versions.length + 1}`,
    }
    setVersions([...versions, newVersion])
    setCurrentVersion(newVersion.id)
  }

  const revertToVersion = (id: string) => {
    setCurrentVersion(id)
    // Here you would also need to update the canvas state to reflect this version
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version Control</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="w-full mb-4" onClick={saveVersion}>
          <Save className="h-4 w-4 mr-2" />
          Save Version
        </Button>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span className="text-sm">{version.description}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => revertToVersion(version.id)}
                disabled={currentVersion === version.id}
              >
                <Undo className="h-4 w-4 mr-2" />
                Revert
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default VersionControl

