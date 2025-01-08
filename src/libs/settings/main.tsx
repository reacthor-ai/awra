'use client'

import { Button } from "@/components/ui/button"
import { signIn } from 'next-auth/react'
import { useAuthSignOut } from "@/hooks/use-auth-signout";
import { clearGuestData } from "@/lib/guestDb";

type SettingsProps = {
  remainingChat: number | null
  isGuest: boolean
  name: string
}

export function Settings({remainingChat, isGuest, name}: SettingsProps) {
  const {
    signOut
  } = useAuthSignOut()
  return (
    <div className="container mx-auto max-w-2xl px-4">
      <header className="sticky top-0 z-50 border-b mb-8 bg-white/80 backdrop-blur">
        <div className="flex h-16 items-center">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
      </header>
      {
        isGuest ? (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-2 text-center">Sign in</h2>
              <p className="text-gray-600 mb-4 text-center">
                Connect your Google account to access additional chats.
              </p>
              <Button
                className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-300 ease-in-out"
                onClick={() => {
                  return signIn('google')
                    .then(async () => {
                      await clearGuestData()
                    })
                }}
              >
                Sign in with Google
              </Button>
            </section>
          </>
        ) : (
          <>
            Logged in as {name}

            <br/>
            <Button
              onClick={() => signOut()}
              variant="ghost">Log out?</Button>
          </>
        )
      }

      {remainingChat !== null && (
        <section className="text-center">
          <h2 className="text-xl font-semibold mb-2">Remaining Chats</h2>
          <p className="text-3xl font-bold text-red-500">{remainingChat} left</p>
        </section>
      )}
    </div>
  )
}

