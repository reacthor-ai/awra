export interface ResourceCount {
  count: number;
  url: string;
}

export interface CboEstimate {
  description: string;
  pubDate: string;
  title: string;
  url: string;
}

export interface CommitteeReport {
  citation: string;
  url: string;
}

export interface Law {
  number: string;
  type: string;
}

export interface PolicyArea {
  name: string;
}

export interface Sponsor {
  bioguideId: string;
  district: number;
  firstName: string;
  fullName: string;
  isByRequest: string;
  lastName: string;
  middleName?: string;
  party: string;
  state: string;
  url: string;
}

export interface BillDetail {
  actions: ResourceCount;
  amendments: ResourceCount;
  cboCostEstimates: CboEstimate[];
  committeeReports: CommitteeReport[];
  committees: ResourceCount;
  congress: number;
  constitutionalAuthorityStatementText: string;
  cosponsors: ResourceCount & { countIncludingWithdrawnCosponsors: number };
  introducedDate: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
  laws: Law[];
  number: string;
  originChamber: string;
  policyArea: PolicyArea;
  relatedBills: ResourceCount;
  sponsors: Sponsor[];
  subjects: ResourceCount;
  summaries: ResourceCount;
  textVersions: ResourceCount;
  title: string;
  titles: ResourceCount;
  type: string;
  updateDate: string;
  updateDateIncludingText: string;
}

export interface BillDetailResponse {
  bill: BillDetail;
}

export type BillType = 'hr' | 's' | 'hjres' | 'sjres' | 'hconres' | 'sconres' | 'hres' | 'sres';
