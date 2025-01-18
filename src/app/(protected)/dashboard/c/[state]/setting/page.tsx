import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { Settings } from "@/libs/settings/main";
import { auth } from "auth";
import { redirect } from "next/navigation";

export default async function SettingPage(_: NextPageProps<{ state: string }>) {
  const session = await auth()
  if (!session || !session!.user.id) {
    redirect('/')
  }

  const email = session?.user.email ?? ''

  return (
    <MainNavigation title='Settings'>
      <Settings
        email={email}
      />
    </MainNavigation>
  );
}