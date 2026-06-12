import { useEffect, useState } from 'react'

// Generic value debounce: returns `value` only after it has stopped changing for
// `delay` ms. The setState runs inside the setTimeout callback (a timer), not
// synchronously in the effect body, so it doesn't trip React 19's
// `react-hooks/set-state-in-effect` rule. The cleanup clears the pending timer on
// every change, so only the final value after the quiet period is committed.
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
