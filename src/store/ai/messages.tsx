import { atom, useAtom, useSetAtom } from 'jotai';
import { createQueryAtom } from '@/store/createQueryAtom';
import { apiRoutes } from "@/utils/api-links";
import { useCallback, useEffect, useRef } from "react";
import { Message } from "ai/react";

type GetAIMessagesQueryParams = {
  loggedIn: boolean;
  userId: string;
}

type AIMessagesResponse = {
  messages: Message[];
}

const getAIMessagesQueryParamsAtom = atom<GetAIMessagesQueryParams>({
  loggedIn: false,
  userId: '',
});

export const getAIMessagesQueryAtom = createQueryAtom<
  GetAIMessagesQueryParams,
  AIMessagesResponse,
  unknown
>(
  'getAIMessages',
  apiRoutes.bills.ai.getAIMessages,
  getAIMessagesQueryParamsAtom,
  ({userId, loggedIn}) => {
    return {
      userId: userId || '',
      loggedIn: Boolean(loggedIn)
    };
  }
)

export const useGetAIMessagesAtom = () => useAtom(getAIMessagesQueryAtom)

export const useGetAIMessages = (userId: string, loggedIn: boolean) => {
  const setParams = useSetAtom(getAIMessagesQueryParamsAtom);
  const [{data, isLoading, error}, refetch] = useAtom(getAIMessagesQueryAtom);
  const isMounted = useRef(true);
  const previousParamsRef = useRef({userId: '', loggedIn: false});

  const fetchAIMessages = useCallback(() => {
    if (
      isMounted.current &&
      userId &&
      (userId !== previousParamsRef.current.userId ||
        loggedIn !== previousParamsRef.current.loggedIn)
    ) {
      previousParamsRef.current = {userId, loggedIn};
      setParams({
        loggedIn,
        userId
      });
    }
  }, [setParams, userId, loggedIn]);

  useEffect(() => {
    isMounted.current = true;

    if (userId) {
      fetchAIMessages();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchAIMessages, userId, loggedIn]);

  return {
    messages: data?.result?.messages,
    isLoadingAIMessages: isLoading,
    error,
    refetchAIMessages: refetch,
    fetchAIMessages
  };
};