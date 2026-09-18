import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delay` ms.
 *
 * Lets a search field stay fully controlled (so it can be cleared
 * programmatically) while the query it drives only fires once typing settles.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
