import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { BillsFeed } from "@/libs/bills/main";
import { getBillsWithPolicy } from "@/api/external/bill/get-bills-with-policy";

export default async function ContentPage(props: NextPageProps<{ state: string }>) {
  const nextParams = await props.params;
  const searchParams = await props.searchParams;

  const additionalBills = await getBillsWithPolicy(searchParams)
  return (
    <MainNavigation title='Discover'>
      <BillsFeed
        initialBills={{bills: additionalBills}}
        state={nextParams.state}
      />
    </MainNavigation>
  );
}