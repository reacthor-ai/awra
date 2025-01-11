import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { Settings } from "@/libs/settings/main";
import { auth } from "auth";
import { getAnonymousRemainingGuestChats } from "@/api/internal/anonymous/tracking";
import { redirect } from "next/navigation";

export default async function SettingPage(_: NextPageProps<{ state: string }>) {
  const session = await auth()
  if (!session || !session!.user.id) {
    redirect('/')
  }

  const remainingGuestChat = await getAnonymousRemainingGuestChats(
    (session!.user.id as string)
  )

  const isGuest = session?.user.isGuest as boolean
  const name = session?.user.name ?? ''

  return (
    <MainNavigation title='Settings'>
      <Settings
        remainingChat={remainingGuestChat}
        name={name}
        isGuest={isGuest}
      />
    </MainNavigation>
  );
}