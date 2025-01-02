import { atom, useAtom, useSetAtom } from 'jotai';
import { createQueryAtom } from '@/store/createQueryAtom';
import { apiRoutes } from "@/utils/api-links";
import { useCallback, useEffect } from "react";
import { BillDetailResponse, BillType } from "@/types/bill-details";

type GetBillDetailsQueryParams = {
  congress: number;
  billType: BillType;
  billNumber: number;
}

const getBillDetailsQueryParamsAtom = atom<GetBillDetailsQueryParams>({
  congress: 0,
  billType: 'hr',
  billNumber: 0
});

export const getBillDetailsQueryAtom = createQueryAtom<
  GetBillDetailsQueryParams,
  BillDetailResponse,
  unknown
>(
  'getBillDetails',
  apiRoutes.bills.getBillDetails,
  getBillDetailsQueryParamsAtom,
  (params) => params
)

export const useGetBillDetailsAtom = () => useAtom(getBillDetailsQueryAtom)

export const useGetBillDetails = (initialParams?: GetBillDetailsQueryParams) => {
  const setParams = useSetAtom(getBillDetailsQueryParamsAtom);
  const [{data, isLoading, error, refetch}] = useAtom(getBillDetailsQueryAtom);

  const fetchBillDetails = useCallback((params: GetBillDetailsQueryParams) => {
    setParams(params);
  }, [setParams]);

  useEffect(() => {
    if (initialParams) {
      fetchBillDetails(initialParams);
    }
  }, [initialParams, fetchBillDetails]);

  return {
    data: data?.result,
    isLoadingBillDetails: isLoading,
    error,
    refetchBillDetails: refetch,
    fetchBillDetails
  };
}
