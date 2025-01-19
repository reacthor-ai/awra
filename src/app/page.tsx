import LandingPage from "@/libs/web/home/main";
import { auth } from "auth";
import { redirect } from "next/navigation";
import { navigationLinks } from "@/utils/nav-links";

export default async function Home() {
  const session = await auth()

  if (session && session.user.email) {
    redirect(navigationLinks.dashboard())
  }

  return <LandingPage/>
}
