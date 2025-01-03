'use client'

import { SessionProvider } from 'next-auth/react'
import { useGuestAuth } from "@/hooks/use-guest-auth";

function GuestAuthInitializer({children}: { children: React.ReactNode }) {
  useGuestAuth()
  return <>{children}</>
}

export function AuthProvider({children}: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GuestAuthInitializer>
        {children}
      </GuestAuthInitializer>
    </SessionProvider>
  )
}