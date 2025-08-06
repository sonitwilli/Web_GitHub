import { useState } from 'react';

export default function useBlockPlayer() {
  const [isStartPlayTrailer, setIsStartPlayTrailer] = useState(false);
  const [isPlaySuccess, setIsPlaySuccess] = useState(false);

  return {
    isStartPlayTrailer,
    setIsStartPlayTrailer,
    isPlaySuccess,
    setIsPlaySuccess,
  };
}
