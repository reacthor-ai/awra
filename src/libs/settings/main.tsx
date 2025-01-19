'use client'

import { Button } from "@/components/ui/button"
import { useAuthSignOut } from "@/hooks/use-auth-signout";

type SettingsProps = {
  email: string
}

export function Settings({email}: SettingsProps) {
  const {
    signOut
  } = useAuthSignOut()
  return (
    <div className="container mx-auto max-w-2xl px-4">
      <header className="sticky top-0 z-50 border-b mb-8 bg-background backdrop-blur">
        <div className="flex h-16 items-center">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
      </header>

      Logged in as {email}

      <br/>
      <Button
        onClick={() => signOut()}
        variant="ghost">Log out?</Button>
    </div>
  )
}

