import React from 'react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  onTryAgain: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onTryAgain }) => {
  return (
    <div className="flex min-h-[93vh] items-center flex-col justify-center gap-6">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm2 30h-4v-4h4v4zm0-8h-4V14h4v12z"
          fill="currentColor"
        />
      </svg>
      <h3 className="text-base font-normal leading-tight text-white/60 mb-0">
        Không tìm thấy nội dung
      </h3>
      <button
        className={`border-0 outline-unset text-base font-semibold leading-tight text-white rounded-lg px-16 h-10 mt-2 ${styles.tryAgainButton}`}
        onClick={onTryAgain}
      >
        Nhấn để thử lại
      </button>
    </div>
  );
};

export default ErrorState;
