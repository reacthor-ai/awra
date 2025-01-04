import { NextResponse } from 'next/server';
import { getBills, GetBillsParams } from "@/api/external/bill/get-bills";
import { BillDetail } from "@/types/bill-details";

export async function GET(req: Request) {
  const apiKey = process.env.CONGRESS_GOV_API_KEY;
  if (!apiKey) {
    return NextResponse.json({error: 'API key not configured'}, {status: 500});
  }

  try {
    const {searchParams} = new URL(req.url);
    const params: GetBillsParams = {
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      fromDateTime: searchParams.get('fromDateTime') ?? undefined,
      toDateTime: searchParams.get('toDateTime') ?? undefined,
      sort: searchParams.get('sort') as 'updateDate+asc' | 'updateDate+desc' | undefined,
    };

    const billsResponse = await getBills(apiKey, params);

    if (!("bills" in billsResponse)) {
      return NextResponse.json({error: 'Congress API is down', bills: []}, {status: 500});
    }

    const searchSpecificBillParams = new URLSearchParams();
    searchSpecificBillParams.set('api_key', apiKey)
    const additionalBillsPromises = billsResponse.bills.map(async (billDetail) => {
      const url = new URL(billDetail.url)
      url.search = searchSpecificBillParams.toString()

      const resp = await fetch(url, {
        cache: 'force-cache',
      })

      const response: { bill: BillDetail } = await resp.json()

      return {
        ...billDetail,
        policyName: response.bill.policyArea?.name ?? null
      }
    })
    const additionalBills = await Promise.all(additionalBillsPromises)

    return NextResponse.json({
      bills: additionalBills,
      error: null
    }, {status: 200});
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({bills: [], error: 'Internal Server Error'}, {status: 500});
  }
}
