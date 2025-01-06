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
  policyArea: { name: string }
}

export interface BillsResponse {
  bills: Bill[];
}
