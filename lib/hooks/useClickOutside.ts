import { useEffect, useRef } from 'react';

function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  whitelist?: string[],
) {
  const ref = useRef<T | null>(null);

  try {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        const target = event.target as Node;

        const isInRef = ref.current && ref.current.contains(target);
        const isInWhitelist = whitelist?.some((id) => {
          const el = document.getElementById(id);
          return el && el.contains(target);
        });

        if (!isInRef && !isInWhitelist) {
          callback();
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [callback, whitelist]);
  } catch {}

  return ref;
}

export default useClickOutside;
