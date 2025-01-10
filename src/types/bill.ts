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
}

export type BillModified = Bill & {
  policyName: string
  textVersionsExist: boolean;
  cboUrl: string | null
  sessionId: string
  billUrl: string
}

export type BillModifiedResponse = {
  bills: BillModified[]
}

export interface BillsResponse {
  bills: Bill[];
}
