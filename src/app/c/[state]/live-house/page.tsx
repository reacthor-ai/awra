import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { LiveHouse } from "@/libs/live-house/main";
import { getHouseFeed } from "@/api/external/house/feed";

export default async function LiveHousePage(props: NextPageProps<{ state: string }>) {
  const {currentState, schedule} = await getHouseFeed()

  return (
    <MainNavigation title='Live house'>
      <LiveHouse currentState={currentState} schedule={schedule}/>
    </MainNavigation>
  );
}