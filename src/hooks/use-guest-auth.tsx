import { signIn, useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { clearGuestData, getOrCreateGuestUser, hasActiveGuest } from '@/lib/guestDb'

export function useGuestAuth() {
  const {data: session, status} = useSession()
  const initializingRef = useRef(false)

  useEffect(() => {
    const handleAuthStateChange = async () => {
      if (initializingRef.current) return;

      try {
        initializingRef.current = true;
        // If user is authenticated but not as guest, clear any guest data
        if (status === 'authenticated' && !session?.user?.isGuest) {
          const hasGuest = await hasActiveGuest();
          if (hasGuest) {
            await clearGuestData();
          }
          return;
        }

        // Handle unauthenticated state
        if (status === 'unauthenticated') {
          const guestUser = await getOrCreateGuestUser();
          await signIn('guest', {
            redirect: false,
            guestId: guestUser.id
          });
        }
      } catch (error) {
        console.error('Auth state handling error:', error);
      } finally {
        initializingRef.current = false;
      }
    }

    handleAuthStateChange();
  }, [status, session?.user?.isGuest])

  return {
    session,
    status,
    isGuest: session?.user?.isGuest ?? false
  }
}