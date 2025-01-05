import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { Settings } from "@/libs/settings/main";
import { auth } from "auth";
import { getRemainingGuestChats } from "@/api/internal/chat/getOrCreateBillChat";

export default async function SettingPage(_: NextPageProps<{ state: string }>) {
  const session = await auth()

  const remainingGuestChat = await getRemainingGuestChats(
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