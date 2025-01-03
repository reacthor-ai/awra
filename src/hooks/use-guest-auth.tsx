import { signIn, useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { getOrCreateGuestUser } from '@/lib/guestDb'

export function useGuestAuth() {
  const {data: session, status} = useSession()
  const initializingRef = useRef(false)

  useEffect(() => {
    const initGuestSession = async () => {
      if (initializingRef.current || status !== 'unauthenticated') {
        return
      }

      try {
        initializingRef.current = true
        const guestUser = await getOrCreateGuestUser()

        if (status === 'unauthenticated') {
          await signIn('guest', {
            redirect: false,
            guestId: guestUser.id
          })
        }
      } catch (error) {
        console.error('Failed to initialize guest session:', error)
      } finally {
        initializingRef.current = false
      }
    }

    initGuestSession()
  }, [status])

  return {
    session,
    status,
    isGuest: session?.user?.isGuest ?? false
  }
}