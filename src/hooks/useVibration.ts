import { useCallback } from 'react';

export const useVibration = () => {
  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  return vibrate;
};