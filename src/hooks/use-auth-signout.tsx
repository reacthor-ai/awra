import { signOut } from 'next-auth/react';
import { clearGuestData } from "@/lib/guestDb";
import { useRouter } from "next/navigation";

export const useAuthSignOut = () => {
  const router = useRouter()
  const handleSignOut = async () => {
    try {
      await Promise.all([
        fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
        }),
        clearGuestData()
      ])

      await new Promise(resolve => setTimeout(resolve, 250));

      const data = await signOut({
        redirect: false,
        callbackUrl: '/'
      });

      router.push(data.url)
    } catch (error) {
      console.error('SignOut error:', error);
      window.location.href = '/'
    }
  };

  return {signOut: handleSignOut};
};