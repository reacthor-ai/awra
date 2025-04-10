import { signOut } from 'next-auth/react';
import { clearGuestData } from "@/lib/guestDb";
import { useRouter } from "next/navigation";
import { apiRoutes } from "@/utils/api-links";
import { navItems } from "@/libs/navigation/nav-items";
import { navigationLinks } from "@/utils/nav-links";

export const useAuthSignOut = () => {
  const router = useRouter()
  const handleSignOut = async () => {
    try {
      const data = await signOut({
        redirect: true,
        callbackUrl: '/'
      });

      router.push(navigationLinks.login())
    } catch (error) {
      console.error('SignOut error:', error);
      window.location.href = '/'
    }
  };

  return {signOut: handleSignOut};
};