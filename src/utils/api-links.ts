export const apiRoutes = {
  user: {
    updateState: '/dashboard/c/api/update-state',
  },
  bills: {
    getBills: '/dashboard/c/api/bills/get-bills',
    getBillDetails: '/dashboard/c/api/bills/get-bill-details',
    agent: '/dashboard/c/api/bills/ai/bill-agent',
    ai: {
      getAIMessages: '/dashboard/c/api/bills/ai/messages',
      getQuickAnalyst: '/dashboard/c/api/bills/ai/bill-quick-analysis',
    }
  },
}
