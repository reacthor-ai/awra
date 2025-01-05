'use client'

import { createElement, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { navigationLinks } from "@/utils/nav-links";
import { navItems } from "@/libs/navigation/nav-items";

export const BottomNav = ({title}: { title: string }) => {
  const [active, setActive] = useState(title.toLowerCase())
  const router = useRouter()
  const params = useParams()

  return (
    <div className="fixed bottom-0 left-0 right-0 shadow-md md:hidden border-t">
      <div className="relative h-14 px-2 bg-background">
        <div className="flex h-full w-full">
          <div className="flex items-center relative flex-1 w-full gap-x-2">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="relative h-full flex items-center justify-center flex-1"
              >
                <button
                  onClick={() => {
                    if (item.id === "library") {
                      setActive(title.toLowerCase())
                      router.push(
                        navigationLinks.library({
                          stateId: params["state"] as string
                        })
                      )
                    }

                    if (item.id === "discover") {
                      setActive(title.toLowerCase())
                      router.push(
                        navigationLinks.content({
                          stateId: params["state"] as string
                        })
                      )
                    }

                    if (item.id === 'settings') {
                      setActive(title.toLowerCase())
                      router.push(
                        navigationLinks.settings({
                          stateId: params["state"] as string
                        })
                      )
                    }
                  }}
                  className="flex flex-col items-center justify-center w-full gap-1 transition-colors duration-200"
                >
                  {createElement(item.icon, {
                    className: `h-5 w-5 ${
                      active === item.id
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`
                  })}
                  <span className={`text-xs ${
                    active === item.id
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}>
                    {item.label}
                  </span>
                  {active === item.id && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm"/>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
