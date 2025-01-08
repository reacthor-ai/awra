export interface Bill {
  congress: number;
  latestAction: {
    actionDate: string;
    text: string;
    actionTime: string
  };
  number: string;
  originChamber: string;
  originChamberCode: string;
  title: string;
  type: string;
  updateDate: string;
  updateDateIncludingText: string;
  url: string;
  policyName: string
  textVersionsExist: boolean;
}

export interface BillsResponse {
  bills: Bill[];
}
