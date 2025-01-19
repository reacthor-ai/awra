"use client"

import { useEffect, useState } from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"
import { X } from 'lucide-react'
import { AlertDialogTitle } from "@/components/ui/alert-dialog";
import { XLogo } from "@/components/ui/XLogo";

export function NewFeatureDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenFeature = localStorage.getItem("hasSeenAIFeature")
    if (!hasSeenFeature) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem("hasSeenAIFeature", "true")
    setIsOpen(false)
  }

  const handleAction = () => {
    if (typeof window !== 'undefined' && 'gtag' in window && process.env.NODE_ENV === 'production') {
      (window as any).gtag('event', 'click_pick_bill', {
        'event_category': 'engagement',
        'event_label': 'Twitter Integration Dialog',
        'value': 1
      });
    }
    handleClose()
  }

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={handleClose}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className="fixed inset-0 z-[99] bg-black/80 animate-in fade-in-0"
        />
        <AlertDialogTitle></AlertDialogTitle>
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[100] translate-x-[-50%] translate-y-[-50%]",
            "max-w-xl w-full bg-black rounded-2xl shadow-xl animate-in fade-in-0 zoom-in-95 overflow-hidden"
          )}
        >
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-10"
          >
            <X className="h-4 w-4 text-gray-400"/>
          </button>

          <div className="flex flex-col md:flex-row">
            <div className="flex flex-col justify-between w-full p-6 text-white">
              <div className="text-left space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <XLogo className="h-6 w-6"/>
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-normal text-gray-300">
                    New Feature
                  </h2>
                  <h3 className="text-white text-2xl font-semibold">
                    Your Voice on Twitter
                  </h3>
                  <p className="text-gray-300 text-base font-normal">
                    Reach Congress through @AwraAI
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-gray-300">
                <p className="text-sm leading-relaxed">
                  Share your views on legislation with Congress through our AI-powered Twitter advocacy. Messages you
                  approve will be posted via @AwraAI.
                </p>
              </div>

              <div className="flex flex-col space-y-2 mt-6">
                <AlertDialogPrimitive.Action
                  onClick={handleAction}
                  className="w-full rounded-lg bg-white text-black py-2.5 text-sm font-medium transition-colors"
                >
                  Pick a bill
                </AlertDialogPrimitive.Action>
              </div>
            </div>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}