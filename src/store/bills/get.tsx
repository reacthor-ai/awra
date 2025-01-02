import { atom, useAtom, useSetAtom } from 'jotai';
import { createQueryAtom } from '@/store/createQueryAtom';
import { apiRoutes } from "@/utils/api-links";
import { useCallback, useEffect } from "react";
import type { Bill } from "@/types/bill";

type ModifiedBill = Bill & {
  policyName: string
}

type GetBillsQueryParams = {
  offset?: number;
  limit?: number;
  fromDateTime?: string;
  toDateTime?: string;
  sort?: 'updateDate+asc' | 'updateDate+desc';
}

const getBillsQueryParamsAtom = atom<GetBillsQueryParams>({})

export const getBillsQueryAtom = createQueryAtom<
  GetBillsQueryParams,
  ModifiedBill[],
  unknown
>(
  'getBills',
  apiRoutes.bills.getBills,
  getBillsQueryParamsAtom,
  (params) => params
)

export const useGetBillsAtom = () => useAtom(getBillsQueryAtom)

export const useGetBills = (initialParams: GetBillsQueryParams = {}) => {
  const setParams = useSetAtom(getBillsQueryParamsAtom);
  const [{data, isLoading, error, refetch}] = useAtom(getBillsQueryAtom);

  const fetchBills = useCallback((params: GetBillsQueryParams) => {
    setParams(params);
  }, [setParams]);

  useEffect(() => {
    if (Object.keys(initialParams).length > 0) {
      fetchBills(initialParams);
    }
  }, [initialParams, fetchBills]);

  return {
    data: data?.result,
    isLoadingBills: isLoading,
    error,
    refetchBills: refetch,
    fetchBills
  };
}
