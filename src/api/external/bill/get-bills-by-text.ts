import { CACHE_TAG_PREFIX } from "@/api/utils/constant";

interface TextFormat {
  type: 'Formatted Text' | 'PDF' | 'Formatted XML';
  url: string;
}

interface TextVersion {
  date: string | null;
  formats: TextFormat[];
  type: string;
}

interface BillTextResponse {
  textVersions: TextVersion[];
}

type BillType = 'hr' | 's' | 'hjres' | 'sjres' | 'hconres' | 'sconres' | 'hres' | 'sres';

interface GetBillTextParams extends Record<string, string | number | undefined> {
  offset?: number;
  limit?: number;
}

/**
 * Creates URLSearchParams for bill text request
 */
function createSearchParams(params: GetBillTextParams, apiKey: string): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.set('api_key', apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    switch (key) {
      case 'offset':
        if (typeof value !== 'number' || value < 0) {
          throw new Error('Offset must be a non-negative number');
        }
        searchParams.set(key, value.toString());
        break;

      case 'limit':
        const limit = Number(value);
        if (limit <= 0 || limit > 250) throw new Error('Limit must be between 1 and 250');
        searchParams.set(key, limit.toString());
        break;
    }
  });

  return searchParams;
}

/**
 * Fetches text versions of a specific bill from the Congress.gov API
 * @param apiKey - Congress.gov API key
 * @param congress - The congress number (e.g., 117)
 * @param billType - The type of bill (e.g., 'hr', 's')
 * @param billNumber - The bill's assigned number
 * @param params - Optional parameters for pagination
 * @returns Promise containing the bill text versions
 */
export async function getBillText(
  apiKey: string,
  congress: number,
  billType: BillType,
  billNumber: number,
  params: GetBillTextParams = {}
): Promise<BillTextResponse> {
  if (!Number.isInteger(congress) || congress < 0) {
    throw new Error('Congress must be a positive integer');
  }

  if (!Number.isInteger(billNumber) || billNumber < 0) {
    throw new Error('Bill number must be a positive integer');
  }

  const baseUrl = `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}/text`;
  const searchParams = createSearchParams(params, apiKey);
  const url = `${baseUrl}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    },
    next: {
      tags: [`${CACHE_TAG_PREFIX}-bill-text-${congress}-${billType}-${billNumber}`],
      revalidate: 3600 // Cache for 1 hour
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<BillTextResponse>;
}