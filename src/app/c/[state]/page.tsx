import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { BillsFeed } from "@/libs/bills/main";

export default async function ContentPage(params: NextPageProps<{ state: string }>) {
  const {params: {state}} = await params

  return (
    <MainNavigation title='Discover'>
      <BillsFeed state={state}/>
    </MainNavigation>
  );
}