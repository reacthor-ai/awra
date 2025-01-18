import { GetCosponsorsParams } from "@/types/bill-sponsors";
import { GetSummariesParams } from "@/api/external/bill/get-summaries";

export function validateBillParams(params: GetCosponsorsParams | GetSummariesParams): void {
  if (params.congress < 1 || params.congress > 150) {
    throw new Error('Invalid congress number');
  }

  const validBillTypes = ['hr', 's', 'hjres', 'sjres', 'hconres', 'sconres', 'hres', 'sres'];
  if (!validBillTypes.includes(params.billType)) {
    throw new Error('Invalid bill type');
  }

  if (params.billNumber < 1) {
    throw new Error('Invalid bill number');
  }

  if (params.offset !== undefined && (params.offset < 0 || !Number.isInteger(params.offset))) {
    throw new Error('Offset must be a non-negative integer');
  }

  if (params.limit !== undefined && (params.limit < 1 || params.limit > 250)) {
    throw new Error('Limit must be between 1 and 250');
  }
}