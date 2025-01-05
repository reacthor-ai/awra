import Link from "next/link"
import { createElement, useState } from "react";
import { useParams } from "next/navigation";
import { NavId, navItems } from "@/libs/navigation/nav-items";
import { navigationLinks } from "@/utils/nav-links";

type SidebarProps = {
  title: string
}

export function Sidebar({title}: SidebarProps) {
  const [active, setActive] = useState(title.toLowerCase())
  const params = useParams()

  const navigate = (navId: NavId) => {
    if (navId === 'discover') {
      return navigationLinks.content({
        stateId: params["state"] as string
      })
    }

    if (navId === 'library') {
      return navigationLinks.library({
        stateId: params["state"] as string
      })
    }

    if (navId === 'settings') {
      return navigationLinks.settings({
        stateId: params["state"] as string
      })
    }

    return navigationLinks.content({
      stateId: params["state"] as string
    })
  }

  return (
    <aside className="w-64 border-r bg-card p-4 space-y-6">

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Explore
          </h2>
          <nav className="space-y-1">
            {
              navItems.map(nav => {
                return (
                  <Link
                    key={nav.id}
                    href={navigate(nav.id)}
                    onClick={() => {
                      setActive(nav.id)
                    }}
                    className={`${active === nav.id ? 'bg-secondary' : ''} flex items-center gap-3 rounded-lg px-4 py-2 text-secondary-foreground`}
                  >
                    {createElement(nav.icon, {
                      className: `h-5 w-5 ${
                        active === nav.id
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`
                    })}
                    {nav.label}
                  </Link>
                )
              })
            }
          </nav>
        </div>
      </div>
    </aside>
  )
}

