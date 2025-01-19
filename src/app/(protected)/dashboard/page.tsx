import StateSelection from "@/libs/state-selection/main";
import { auth } from "auth";
import { cache } from "react";
import { redirect } from "next/navigation";
import { navigationLinks } from "@/utils/nav-links";

const getStates = cache(async () => {
  try {
    const response = await fetch("https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json", {
      cache: 'force-cache',
    });
    if (!response.ok) {
      return {"N/A": "Not Applicable"}
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch states:", error);
    return {"N/A": "Not Applicable"}
  }
})

export default async function DashboardPage() {
  const session = await auth()

  if (!session!.user.state) {
    const states = await getStates()

    return <StateSelection states={states}/>
  }

  redirect(navigationLinks.content({
    stateId: session!.user.state
  }))
}