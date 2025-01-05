/**
 * Get the get bill number from the DB.
 * Has a special colon : bill number at the end.
 * @param roomId
 */
export const getBillNumber = (roomId: string): string =>
  roomId.split(":")[roomId.split(":").length - 1]