import { CACHE_TAG_PREFIX } from "@/api/utils/constant";
import { CosponsorsResponse, GetCosponsorsParams } from "@/types/bill-sponsors";
import { validateBillParams } from "@/api/external/bill/utils";

function createSearchParams(params: GetCosponsorsParams, apiKey: string): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.set('api_key', apiKey);

  if (params.format) searchParams.set('format', params.format);
  if (params.offset !== undefined) searchParams.set('offset', params.offset.toString());
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString());

  return searchParams;
}

/**
 * Fetches cosponsors for a specific bill from the Congress.gov API
 */
export async function getCosponsors(
  apiKey: string,
  params: GetCosponsorsParams
): Promise<CosponsorsResponse> {
  try {
    // Validate parameters
    validateBillParams(params);

    // Construct URL
    const baseUrl = 'https://api.congress.gov/v3/bill';
    const path = `${params.congress}/${params.billType}/${params.billNumber}/cosponsors`;
    const searchParams = createSearchParams(params, apiKey);
    const url = `${baseUrl}/${path}?${searchParams.toString()}`;

    // Make request
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: {
        tags: [`${CACHE_TAG_PREFIX}-cosponsors-${params.congress}-${params.billType}-${params.billNumber}`],
        revalidate: 3600 // Cache for 1 hour
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      console.error(`Error fetching cosponsors: ${response.status} ${response.statusText}`);
      return {cosponsors: []};
    }

    return await response.json() as Promise<CosponsorsResponse>;
  } catch (error) {
    console.error('Error in getCosponsors:', error);
    return {cosponsors: []};
  }
}