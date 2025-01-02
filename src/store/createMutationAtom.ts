import { atomWithMutation } from 'jotai-tanstack-query'

export type MutationResult<R, E> = {
  status: 'fulfilled' | 'rejected'
  result: R | null
  error: E | Error | null
}

export const createMutationAtom = <T, R, E>(
  key: string,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  getToken?: () => Promise<string | null>
) => {
  return atomWithMutation(() => ({
    mutationKey: [key],
    mutationFn: async (params: T): Promise<MutationResult<R, E>> => {
      try {
        let body: string | FormData;
        const headers: HeadersInit = {};

        if (params instanceof FormData) {
          body = params;
        } else {
          body = JSON.stringify(params);
          headers['Content-Type'] = 'application/json';
        }

        if (getToken) {
          const token = await getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const response = await fetch(endpoint, {
          method,
          body,
          headers,
        })

        const data = await response.json()
        if (!response.ok || data && "error" in data) {
          const error = data as E
          return {
            status: 'rejected',
            result: null,
            error
          }
        }

        return {
          status: 'fulfilled',
          result: data as R,
          error: null
        }
      } catch (error) {
        console.error(`Error in ${key} mutation:`, error)
        return {
          status: 'rejected',
          result: null,
          error: error instanceof Error ? error : new Error(String(error))
        }
      }
    }
  }))
}
