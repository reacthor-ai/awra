export const navigationLinks = {
  content: ({stateId}: { stateId: string }) => `/c/${stateId}`,
  billDetails: (
    {billNumber, stateId, congress, billType}: {
      billNumber: string,
      stateId: string,
      congress: string,
      billType: string
    }
  ) => `/c/${stateId}/bill/${billNumber}?congress=${congress}&billType=${billType}`,
  library: ({stateId}: { stateId: string }) => `/c/${stateId}/library`,
  settings: ({ stateId }: { stateId: string }) => `/c/${stateId}/setting`
} as const