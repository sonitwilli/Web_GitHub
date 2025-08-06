import React from 'react';

interface SeparatorLineProps {
  width?: number;
  height?: number;
  className?: string;
}

const SeparatorLine: React.FC<SeparatorLineProps> = ({
  width = 1,
  height = 36,
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 1 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <line
      x1="0.25"
      y1="-1.09278e-08"
      x2="0.250002"
      y2="36"
      stroke="url(#paint0_linear_5942_24036)"
      strokeWidth="0.5"
    />
    <defs>
      <linearGradient
        id="paint0_linear_5942_24036"
        x1="-0.5"
        y1="2.18557e-08"
        x2="-0.499998"
        y2="36"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" stopOpacity="0" />
        <stop offset="0.5" stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export default SeparatorLine;
