'use client'

import type { ReactNode } from 'react'
import { useHydrateAtoms } from 'jotai/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryClientAtom } from 'jotai-tanstack-query'
import type { WritableAtom } from 'jotai'
import { Provider } from 'jotai/react'

type AnyWritableAtom = WritableAtom<unknown, any[], any>

type InitialAtomsHydrate = (readonly [AnyWritableAtom, unknown])[]

type WithChildren = {
  children: ReactNode
}

const queryClient = new QueryClient()

const HydrateAtoms = (props: WithChildren) => {
  const { children } = props

  const initialAtoms: InitialAtomsHydrate = [[queryClientAtom, queryClient]]

  // Hydrate atoms only runs once.
  useHydrateAtoms(initialAtoms)

  return <>{children}</>
}

export const ProviderInitializer = (props: WithChildren) => {
  const { children } = props

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <HydrateAtoms>{children}</HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  )
}
