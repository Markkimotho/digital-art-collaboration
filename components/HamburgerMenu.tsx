"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"

const HamburgerMenu: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 left-4 z-20 bg-white">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Access additional features and settings.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <SheetClose asChild>
            <Button className="w-full">New Project</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="w-full">Open Project</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="w-full">Save Project</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="w-full">Export</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="w-full">Settings</Button>
          </SheetClose>
        </div>
        <SheetClose asChild>
          <Button variant="outline" size="icon" className="absolute top-4 right-4">
            <X className="h-4 w-4" />
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}

export default HamburgerMenu

