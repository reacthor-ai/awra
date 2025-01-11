export interface Cosponsor {
  bioguideId: string;
  district?: number;
  firstName: string;
  fullName: string;
  isOriginalCosponsor: boolean;
  lastName: string;
  middleName?: string;
  party: string;
  sponsorshipDate: string;
  state: string;
  url: string;
}

export interface CosponsorsResponse {
  cosponsors: Cosponsor[];
}

export interface GetCosponsorsParams {
  congress: number;
  billType: 'hr' | 's' | 'hjres' | 'sjres' | 'hconres' | 'sconres' | 'hres' | 'sres';
  billNumber: number;
  format?: 'json' | 'xml';
  offset?: number;
  limit?: number;
}