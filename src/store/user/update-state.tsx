import { useAtom } from 'jotai';
import { createMutationAtom } from '@/store/createMutationAtom';
import { apiRoutes } from "@/utils/api-links";

type UpdateStateParams = {
  state: string
};

type UpdateStateReturn = {
  success: boolean;
};

export const UpdateStateAtom = createMutationAtom<
  UpdateStateParams,
  UpdateStateReturn,
  Error
>(
  'UpdateState',
  apiRoutes.user.updateState,
  'POST'
);

export const useUpdateStateMutation = () => useAtom(UpdateStateAtom);
