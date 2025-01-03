import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { BillsFeed } from "@/libs/bills/main";

export default async function ContentPage(props: NextPageProps<{ state: string }>) {
  const nextParams = await props.params

  return (
    <MainNavigation title='Discover'>
      <BillsFeed state={nextParams.state}/>
    </MainNavigation>
  );
}