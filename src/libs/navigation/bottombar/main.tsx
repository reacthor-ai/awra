import React from 'react'
import { Home, Users, FileText, Mail } from 'lucide-react'

const BottomNav = () => {
  const [active, setActive] = React.useState('home')

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'representatives', label: 'Representatives', icon: Users },
    { id: 'bills', label: 'Bills', icon: FileText },
    { id: 'contact', label: 'Contact', icon: Mail }
  ]

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
                  onClick={() => setActive(item.id)}
                  className="flex flex-col items-center justify-center w-full gap-1 transition-colors duration-200"
                >
                  {React.createElement(item.icon, {
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
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
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

export default BottomNav
