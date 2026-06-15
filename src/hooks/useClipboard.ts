'use client';

import { useState, useCallback } from 'react';

interface UseClipboardReturn {
  value: string | null;
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
}

export function useClipboard(): UseClipboardReturn {
  const [value, setValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      setError('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setValue(text);
      setCopied(true);
      setError(null);

      // reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy');
      setCopied(false);
      return false;
    }
  }, []);

  return {
    value,
    copy,
    copied,
    error,
  };
}
