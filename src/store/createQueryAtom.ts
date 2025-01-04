import { atomWithQuery } from 'jotai-tanstack-query'
import { PrimitiveAtom } from 'jotai'

export type WithInitialValue<Value> = {
  init: Value
}

export type QueryResult<T, QueryError> = {
  status: 'fulfilled' | 'rejected'
  result: T | null
  error: QueryError | Error | null
}

type QueryParams = Record<string, string | number | boolean | null>

export const createQueryAtom = <T, E, QueryError>(
  key: string,
  endpoint: string,
  atom: PrimitiveAtom<T> & WithInitialValue<T>,
  paramsBuilder: (value: T) => QueryParams
) => {
  return atomWithQuery(get => {
    const atomValue = get(atom)
    const queryParams = paramsBuilder(atomValue)
    const queryKey = [key, queryParams]

    return {
      queryKey,
      queryFn: async ({queryKey: [, params]}): Promise<QueryResult<E, QueryError>> => {
        const searchParams = new URLSearchParams()
        Object.entries(params as QueryParams).forEach(([key, value]) => {
          searchParams.append(key, String(value))
        })

        const url = `${endpoint}?${searchParams.toString()}`

        try {
          const response = await fetch(url, {
            next: {revalidate: 3600},
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const result = await response.json()

          if (!response.ok) {
            const error = result as QueryError
            return {
              status: 'rejected',
              result: null,
              error,
            }
          }
          return {
            status: 'fulfilled',
            result: result as E,
            error: null
          }
        } catch (error) {
          console.error(`Error in ${key} query:`, error)
          return {
            status: 'rejected',
            result: null,
            error: error instanceof Error ? error : new Error(String(error))
          }
        }
      }
    }
  })
}