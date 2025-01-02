import MainNavigation from "@/libs/navigation/main";
import { BillDetails } from "@/libs/bills/details/main";
import { NextPageProps } from "@/utils/next-props";
import { BillType } from "@/types/bill-details";
import { getBillDetails } from "@/api/external/bill/get-bills-details";
import { getBillText } from "@/api/external/bill/get-bills-by-text";
import { constructCBOUrl } from "@/utils/url";
import { notFound } from "next/navigation";

export default async function BillDetailPage(params: NextPageProps<{ billNumber: string, state: string }>) {
  const {params: {billNumber, state}, searchParams} = params;

  const congressParams = (await searchParams)['congress'] as string;
  const billTypeParams = (await searchParams)['billType'] as BillType;

  const [billDetails, billByText] = await Promise.all([
    getBillDetails(
      process.env.CONGRESS_GOV_API_KEY as string,
      parseInt(congressParams, 10),
      (billTypeParams.toLowerCase() as BillType),
      parseInt(billNumber, 10)
    ),
    getBillText(
      process.env.CONGRESS_GOV_API_KEY as string,
      parseInt(congressParams, 10),
      (billTypeParams.toLowerCase() as BillType),
      parseInt(billNumber, 10),
      {}
    )
  ])

  const textFormat = billByText.textVersions[0] ? billByText.textVersions[0]?.formats?.find(
    (format) => format.type === 'Formatted Text'
  ) : null

  const cboUrl = constructCBOUrl(billDetails, billNumber)

  if (!textFormat?.url) {
    notFound()
  }

  return (
    <MainNavigation title={null}>
      <BillDetails
        title={billDetails.bill.title}
        originChamber={billDetails.bill.originChamber}
        originChamberCode={billDetails.bill.originChamber}
        billNumber={billNumber}
        latestAction={billDetails.bill.latestAction.text}
        policy={billDetails.bill?.policyArea?.name ?? ''}
        url={textFormat.url}
        cboUrl={cboUrl}
      />
    </MainNavigation>
  )
}