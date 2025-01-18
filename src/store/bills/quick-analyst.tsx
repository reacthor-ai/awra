import { useAtom } from 'jotai';
import { createMutationAtom } from '@/store/createMutationAtom';
import { apiRoutes } from "@/utils/api-links";

type QuickAnalystParams = {
  sessionId: string
  billUrl: string
  cboUrl: string | null
  message: string
};

type QuickAnalystReturn = {
  content: string;
};

export const QuickAnalystAtom = createMutationAtom<
  QuickAnalystParams,
  QuickAnalystReturn,
  Error
>(
  'QuickAnalyst',
  apiRoutes.bills.ai.getQuickAnalyst,
  'POST'
);

export const useQuickAnalystMutation = () => useAtom(QuickAnalystAtom);
