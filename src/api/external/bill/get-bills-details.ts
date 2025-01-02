import { CACHE_TAG_PREFIX } from "@/api/utils/constant";
import { BillDetailResponse, BillType } from "@/types/bill-details";

/**
 * Fetches detailed information about a specific bill from the Congress.gov API
 * @param apiKey - Congress.gov API key
 * @param congress - The congress number (e.g., 117)
 * @param billType - The type of bill (e.g., 'hr', 's')
 * @param billNumber - The bill's assigned number
 * @returns Promise containing the detailed bill response
 */
export async function getBillDetails(
  apiKey: string,
  congress: number,
  billType: BillType,
  billNumber: number
): Promise<BillDetailResponse> {
  // Validate inputs
  if (!Number.isInteger(congress) || congress < 0) {
    throw new Error('Congress must be a positive integer');
  }

  if (!Number.isInteger(billNumber) || billNumber < 0) {
    throw new Error('Bill number must be a positive integer');
  }

  const baseUrl = `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}`;
  const searchParams = new URLSearchParams({
    api_key: apiKey
  });

  const url = `${baseUrl}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    },
    next: {
      tags: [`${CACHE_TAG_PREFIX}-bill-${congress}-${billType}-${billNumber}`],
      revalidate: 3600 // Cache for 1 hour
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<BillDetailResponse>;
}