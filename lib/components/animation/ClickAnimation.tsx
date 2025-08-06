import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const ClickAnimation: React.FC = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/animations/click-animation-fid.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  if (!animationData) return null;

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ background: 'transparent' }}
    />
  );
};

export default ClickAnimation;
