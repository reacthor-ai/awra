import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { Library } from "@/libs/library/main";
import { auth } from "auth";
import prisma, { ChatAwraUserExtend } from "@/lib/prisma";

export default async function LibraryPage(_: NextPageProps<{ state: string }>) {

  const session = await auth()

  const chatList = await prisma.chat.findMany({
    where: {
      userId: (session!.user.id as string),
    },
    select: {
      user: true,
      id: true,
      roomId: true,
      title: true,
      summary: true,
      createdAt: true,
      updatedAt: true,
      userId: true
    }
  })

  return (
    <MainNavigation title='Library'>
      <Library chatList={chatList as ChatAwraUserExtend[]} />
    </MainNavigation>
  );
}