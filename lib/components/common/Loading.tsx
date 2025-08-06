import React from 'react';

const SpinnerLoading: React.FC = () => {
  return (
    <div className="absolute left-1/2 top-1/2 flex w-[121px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-[#5e5d5d] border-r-[#5e5d5d] border-b-[#5e5d5d] border-l-transparent" />
    </div>
  );
};

export default SpinnerLoading;