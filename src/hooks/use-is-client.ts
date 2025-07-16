
"use client";

import { useState, useEffect } from 'react';

/**
 * A custom hook that returns `true` only after the component has mounted on the client.
 * This is useful to prevent hydration mismatches for UI that depends on client-only
 * APIs or state (like window size, or in this case, simply knowing it's not the server).
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
