import { auth } from "auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout(props: {
  children: React.ReactNode
}) {
  const {children} = props

  const session = await auth()

  if (!session || !session.user.id) {
    redirect('/')
  }

  return <>{children}</>
}