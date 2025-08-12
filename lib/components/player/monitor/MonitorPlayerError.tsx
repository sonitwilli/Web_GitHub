import React from 'react';

interface ErrorData {
  code: string;
  category: string;
  content: string;
}

interface MonitorPlayerErrorProps {
  errors: ErrorData[];
}

const MonitorPlayerError: React.FC<MonitorPlayerErrorProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-red-900 border border-red-600 rounded-lg p-4 max-w-sm mx-4">
        <div className="text-red-200 text-sm">
          {errors.map((error, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="font-semibold">{error.code}</div>
              <div className="text-xs opacity-75">{error.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitorPlayerError;
