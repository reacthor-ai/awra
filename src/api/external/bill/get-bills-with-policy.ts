import { BillDetail } from "@/types/bill-details";
import { getBills } from "@/api/external/bill/get-bills";
import { constructCBOUrl } from "@/utils/url";
import { transformRoomId } from "@/utils/transformRoomId";
import { getFormattedText } from "@/utils/getFormattedText";

type SearchParams = {
  limit?: string;
  fromDateTime?: string;
  toDateTime?: string;
  sort?: 'updateDate+asc' | 'updateDate+desc';
}

export async function getBillsWithPolicy(
  searchParams: SearchParams,
) {
  let offset = 0;
  let limit = 25;

  if (searchParams.limit) {
    const [start, end] = searchParams.limit.split('-').map(Number);
    if (!isNaN(start) && !isNaN(end)) {
      offset = start - 1;
      limit = end - start + 1;
    }
  }

  const fromDateTime = searchParams.fromDateTime
    ? `${searchParams.fromDateTime}T00:00:00Z`
    : undefined;

  const toDateTime = searchParams.toDateTime
    ? `${searchParams.toDateTime}T23:59:59Z`
    : undefined;

  const billsResponse = await getBills(process.env.CONGRESS_GOV_API_KEY as string, {
    offset,
    limit,
    fromDateTime,
    toDateTime,
    sort: searchParams.sort || 'updateDate+desc'
  });

  const searchSpecificBillParams = new URLSearchParams();
  searchSpecificBillParams.set('api_key', process.env.CONGRESS_GOV_API_KEY as string);

  const additionalBillsPromises = billsResponse.bills ? billsResponse.bills.map(async (billDetail) => {
    const url = new URL(billDetail.url);
    url.search = searchSpecificBillParams.toString();
    const resp = await fetch(url, {
      cache: 'force-cache',
    });

    const response: { bill: BillDetail } = await resp.json();
    const cboUrl = constructCBOUrl(response, response.bill.number)

    let billUrl = ''
    const textVersionsExist = "textVersions" in response.bill && response.bill.textVersions.count >= 1

    if (textVersionsExist) {
      const billTextUrl = new URL(response.bill.textVersions.url)
      billTextUrl.search = searchSpecificBillParams.toString()
      const billTextResponse = await fetch(billTextUrl, {
        cache: 'force-cache'
      })

      const billTextData = await billTextResponse.json()
      const textVersion = getFormattedText(billTextData)

      billUrl = !textVersion?.url ? '' : textVersion.url
    }

    return {
      ...billDetail,
      policyName: response.bill.policyArea?.name ?? null,
      textVersionsExist,
      cboUrl,
      sessionId: transformRoomId(response.bill.type, response.bill.number),
      billUrl,
    };
  }) : [];
  return await Promise.all(additionalBillsPromises);
}