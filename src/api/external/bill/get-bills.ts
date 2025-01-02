import { BillsResponse } from "@/types/bill";
import { CACHE_TAG_PREFIX } from "@/api/utils/constant";

export interface GetBillsParams extends Record<string, string | number | undefined> {
  offset?: number;
  limit?: number;
  fromDateTime?: string;
  toDateTime?: string;
  sort?: 'updateDate+asc' | 'updateDate+desc';
}

/**
 * Creates URLSearchParams from GetBillsParams, validating values
 */
function createSearchParams(params: GetBillsParams, apiKey: string): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Always add API key
  searchParams.set('api_key', apiKey);

  // Validate and add params
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    switch (key) {
      case 'offset':
        if (isNaN(Number(value))) throw new Error('Offset must be a valid number');
        if (Number(value) < 0) throw new Error('Offset must be non-negative');
        searchParams.set(key, value.toString());
        break;

      case 'limit':
        const limit = Number(value);
        if (limit <= 0 || limit > 250) throw new Error('Limit must be between 1 and 250');
        searchParams.set(key, limit.toString());
        break;

      case 'fromDateTime':
      case 'toDateTime':
        if (isNaN(Date.parse(String(value)))) throw new Error(`Invalid ${key} format`);
        searchParams.set(key, String(value));
        break;

      case 'sort':
        const validSortValues = ['updateDate+asc', 'updateDate+desc'];
        if (!validSortValues.includes(String(value))) {
          throw new Error('Invalid sort parameter');
        }
        searchParams.set(key, String(value));
        break;
    }
  });

  return searchParams;
}

/**
 * Fetches bills from the Congress.gov API
 */
export async function getBills(
  apiKey: string,
  params: GetBillsParams = {}
): Promise<BillsResponse> {
  const baseUrl = 'https://api.congress.gov/v3/bill';
  const searchParams = createSearchParams(params, apiKey);
  const url = `${baseUrl}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    },
    next: {
      tags: [`${CACHE_TAG_PREFIX}-bills`],
      revalidate: 3600 // Cache for 1 hour
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<BillsResponse>;
}
