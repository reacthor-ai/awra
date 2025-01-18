import { NextResponse } from 'next/server';
import { getBillDetails } from "@/api/external/bill/get-bills-details";
import { BillType } from "@/types/bill-details";

export async function GET(req: Request) {
  const apiKey = process.env.CONGRESS_GOV_API_KEY;
  if (!apiKey) {
    return NextResponse.json({error: 'API key not configured'}, {status: 500});
  }

  try {
    const { searchParams } = new URL(req.url);
    const congress = searchParams.get('congress');
    const billType = searchParams.get('billType') as BillType;
    const billNumber = searchParams.get('billNumber');

    if (!congress || !billType || !billNumber) {
      return NextResponse.json({error: 'Congress, bill type, and bill number are required'}, {status: 400});
    }

    const congressNum = parseInt(congress, 10);
    const billNumberNum = parseInt(billNumber, 10);

    if (isNaN(congressNum) || isNaN(billNumberNum)) {
      return NextResponse.json({error: 'Congress and bill number must be valid numbers'}, {status: 400});
    }

    const billDetailsResponse = await getBillDetails(apiKey, congressNum, billType, billNumberNum);
    return NextResponse.json(billDetailsResponse, {status: 200});
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
