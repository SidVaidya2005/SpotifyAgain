'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toggleLike } from '@/actions/toggle-like'

const LIKED_KEY = ['liked-songs'] as const

// Optimistic like toggle for a single song. Flips the shared ['liked-songs'] id
// list immediately (onMutate), rolls back + toasts on failure (onError), and
// always re-syncs from the server afterward (onSettled). The mutationFn unwraps
// the ActionResult and throws on { error } so onError fires (library-docs.md).
export function useToggleLike(songId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await toggleLike(songId)
      if ('error' in res) throw new Error(res.error)
      return res.data
    },
    onMutate: async () => {
      // Cancel in-flight refetches so they can't overwrite our optimistic value.
      await qc.cancelQueries({ queryKey: LIKED_KEY })
      const previous = qc.getQueryData<string[]>(LIKED_KEY) ?? []
      const next = previous.includes(songId)
        ? previous.filter((id) => id !== songId)
        : [...previous, songId]
      qc.setQueryData<string[]>(LIKED_KEY, next)
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context) qc.setQueryData<string[]>(LIKED_KEY, context.previous)
      toast.error(error.message || 'Could not update your like.')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: LIKED_KEY }),
  })
}
