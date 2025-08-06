import { useEffect, useState } from 'react';

function useScroll() {
  const [scrollDistance, setScrollDistance] = useState(0);

  const checkScroll = () => {
    const y = window.scrollY;
    setScrollDistance(y);
  };

  useEffect(() => {
    checkScroll();

    window.addEventListener('scroll', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);
  return { scrollDistance };
}

export default useScroll;
