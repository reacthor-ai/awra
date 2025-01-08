import MainNavigation from "@/libs/navigation/main";
import { BillDetails } from "@/libs/bills/details/main";
import { NextPageProps } from "@/utils/next-props";
import { BillType } from "@/types/bill-details";
import { getBillDetails } from "@/api/external/bill/get-bills-details";
import { getBillText } from "@/api/external/bill/get-bills-by-text";
import { constructCBOUrl } from "@/utils/url";
import { notFound, redirect } from "next/navigation";
import { getOrCreateBillChat } from "@/api/internal/chat/getOrCreateBillChat";
import { auth } from 'auth'
import { getChatSessionId } from "@/utils/getChatSessionId";
import { navigationLinks } from "@/utils/nav-links";
import { transformRoomId } from "@/utils/transformRoomId";
import { transformMessages } from "@/utils/transformMessages";
import { getAgentStateBySessionId } from "@/agents/bill/helpers";
import prisma from "@/lib/prisma";

export default async function BillDetailPage(props: NextPageProps<{ billNumber: string, state: string }>) {
  const nextParams = await props.params
  const {billNumber, state} = nextParams;
  const congressParams = (await props.searchParams)['congress'] as string;
  const billTypeParams = (await props.searchParams)['billType'] as BillType;

  const session = await auth()

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

  if (!textFormat?.url) {
    notFound()
  }

  const chatResult = await getOrCreateBillChat({
    userId: (session!.user.id as string),
    title: `Discussion: ${billDetails.bill.title} ${billNumber}`,
    roomId: transformRoomId(billDetails.bill.type, billDetails.bill.number),
    congress: parseInt(congressParams, 10),
    billType: (billTypeParams.toLowerCase() as BillType)
  })

  if (chatResult.remainingChats === 0 && session!.user.isGuest) {
    redirect(navigationLinks.settings({
      stateId: state
    }))
  }

  const cboUrl = constructCBOUrl(billDetails, billNumber)

  const sessionId = getChatSessionId({
    userId: (session!.user.id as string),
    roomId: (chatResult.chat?.id as string),
    billNumber: transformRoomId(billDetails.bill.type, billDetails.bill.number),
  })
  const guestId = session?.user.guestId as string

  const agentState = await getAgentStateBySessionId(sessionId)
  const messages = transformMessages(agentState.messages || [])

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
        sessionId={sessionId}
        guestId={guestId}
        internalMessages={messages}
      />
    </MainNavigation>
  )
}