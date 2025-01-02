export const navigationLinks = {
  content: ({stateId}: { stateId: string }) => `/c/${stateId}`,
  billDetails: (
    {billNumber, stateId}: {
      billNumber: string,
      stateId: string
    }
  ) => `/c/${stateId}/bill/${billNumber}`
} as const