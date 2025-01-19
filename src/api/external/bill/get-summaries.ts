import { CACHE_TAG_PREFIX } from "@/api/utils/constant";
import { validateBillParams } from "@/api/external/bill/utils";

interface GetSummariesParams {
  congress: number;
  billType: string;
  billNumber: number;
  format?: string;
  offset?: number;
  limit?: number;
}

export interface RawSummary {
  actionDate: string;
  actionDesc: string;
  text: string;
  updateDate: string;
  versionCode: string;
}

interface Summary extends Omit<RawSummary, 'text'> {
  text: string;
  rawText: string;
}

function parseHtmlText(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, ' ');

  return withoutTags
    .replace(/\s+/g, ' ')
    .trim();
}

interface RawSummariesResponse {
  summaries: RawSummary[];
}

interface SummariesResponse {
  summaries: Summary[];
}

function createSearchParams(params: GetSummariesParams, apiKey: string): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.set('api_key', apiKey);

  if (params.format) searchParams.set('format', params.format);
  if (params.offset !== undefined) searchParams.set('offset', params.offset.toString());
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString());

  return searchParams;
}

/**
 * Fetches summaries for a specific bill from the Congress.gov API
 */
export async function getSummaries(
  apiKey: string,
  params: GetSummariesParams
): Promise<SummariesResponse> {
  try {
    // Validate parameters
    validateBillParams(params);

    // Construct URL
    const baseUrl = 'https://api.congress.gov/v3/bill';
    const path = `${params.congress}/${params.billType}/${params.billNumber}/summaries`;
    const searchParams = createSearchParams(params, apiKey);
    const url = `${baseUrl}/${path}?${searchParams.toString()}`;

    // Make request
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: {
        tags: [`${CACHE_TAG_PREFIX}-summaries-${params.congress}-${params.billType}-${params.billNumber}`],
        revalidate: 3600 // Cache for 1 hour
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      console.error(`Error fetching summaries: ${response.status} ${response.statusText}`);
      return {summaries: []};
    }

    const rawData = await response.json() as RawSummariesResponse;

    return {
      summaries: rawData.summaries.map(summary => ({
        ...summary,
        rawText: summary.text,
        text: parseHtmlText(summary.text)
      }))
    };
  } catch (error) {
    console.error('Error in getSummaries:', error);
    return {summaries: []};
  }
}