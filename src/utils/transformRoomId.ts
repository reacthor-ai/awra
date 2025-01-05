export const transformRoomId = (billType: string, billNumber: string) =>
    `${billType}:${billNumber}`