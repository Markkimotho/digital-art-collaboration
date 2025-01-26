import type React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

const HamburgerMenu: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="bg-gray-100 hover:bg-gray-200 text-gray-800">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white text-gray-800">
        <SheetHeader>
          <SheetTitle className="text-gray-800">Menu</SheetTitle>
          <SheetDescription className="text-gray-600">Access additional features and settings.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800">New Project</Button>
          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800">Open Project</Button>
          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800">Save Project</Button>
          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800">Export</Button>
          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800">Settings</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default HamburgerMenu

