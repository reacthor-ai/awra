import type { BillDetail } from "@/types/bill-details";

export function constructCBOUrl(billDetails: { bill: BillDetail }, billNumber: string): string | null {
  // Check if CBO estimates exist
  if (!('cboCostEstimates' in billDetails.bill) ||
    !billDetails.bill.cboCostEstimates.length) {
    return null;
  }

  const latestEstimate = billDetails.bill.cboCostEstimates[billDetails.bill.cboCostEstimates.length - 1];

  const date = new Date(latestEstimate.pubDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adjust for 0-based index and ensure two digits
  return `https://www.cbo.gov/system/files/${year}-${month}/hr${billNumber}.pdf`;
}