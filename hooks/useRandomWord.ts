// hooks/useRandomWord.ts
import useSWR from 'swr'
import { useState } from 'react'
import { fetchRandomWord } from '@/lib/api/words'

export function useRandomWord() {
  const [exceptId, setExceptId] = useState<number | undefined>(undefined)

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ['/api/words/random', exceptId],
    ([, id]) => fetchRandomWord(id),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  )

  const refreshWord = (currentId?: number) => {
    setExceptId(currentId)
  }

  return {
    data,
    isLoading,
    isValidating,
    error,
    refreshWord,
  }
}
