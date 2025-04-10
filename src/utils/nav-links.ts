export const navigationLinks = {
  content: ({stateId}: { stateId: string }) => `/dashboard/c/${stateId}`,
  login: () => `/auth/signin`,
  dashboard: () => `/dashboard`,
  verifyRequest: () => `/auth/verify-request`,
  billDetails: (
    {billNumber, stateId, congress, billType}: {
      billNumber: string,
      stateId: string,
      congress: string,
      billType: string
    }
  ) => `/dashboard/c/${stateId}/bill/${billNumber}?congress=${congress}&billType=${billType}`,
  library: ({stateId}: { stateId: string }) => `/dashboard/c/${stateId}/library`,
  settings: ({stateId}: { stateId: string }) => `/dashboard/c/${stateId}/setting`,
  liveHouse: ({stateId}: { stateId: string }) => `/dashboard/c/${stateId}/live-house`,
  articles: {
    ['start-structured-add-dynamic-later']: `/article/1`
  }
} as const