import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { BillsFeed } from "@/libs/bills/main";
import { getBillsWithPolicy } from "@/api/external/bill/get-bills-with-policy";
import { NewFeatureDialog } from "@/libs/alert/new-features";

export default async function ContentPage(props: NextPageProps<{ state: string }>) {
  const nextParams = await props.params;
  const searchParams = await props.searchParams;

  const billsWithPolicy = await getBillsWithPolicy(searchParams)
  return (
    <MainNavigation title='Discover'>
      <div className="fixed inset-0 z-50 pointer-events-none">
        <NewFeatureDialog/>
      </div>
      <BillsFeed
        initialBills={{bills: billsWithPolicy}}
        state={nextParams.state}
      />
    </MainNavigation>
  );
}