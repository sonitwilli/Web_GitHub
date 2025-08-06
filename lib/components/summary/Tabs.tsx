import React from 'react';
import styles from './Tabs.module.css';

interface Message {
  text: string;
  loading: boolean;
}

interface Tab {
  title?: string;
  html?: string;
  overview?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabChange: (index: number) => void;
  loading: boolean;
  messages: Message[];
  isReport: boolean;
  routeBred: string;
  onReport: () => void;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  loading,
  messages,
  isReport,
  routeBred,
  onReport,
}) => {
  return (
    <div className="mt-2">
      <div className="fixed w-full top-13 border-0 flex gap-2.5 p-2 pb-4 bg-rich-black flex-nowrap overflow-x-auto scrollbar-none overflow-y-hidden min-h-8">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`border-0 py-1.5 px-4 text-sm font-semibold leading-tight rounded-full whitespace-nowrap ${
              activeTab === index ? styles.tabActive : styles.tabInactive
            }`}
            onClick={() => onTabChange(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="h-[calc(100vh-116px-env(safe-area-inset-bottom))] overflow-y-auto mt-29">
        {loading && (
          <div className="px-4">
            <div className="w-full h-4 bg-gradient-to-r from-white/9 via-gray-500/87 to-white/9 bg-[length:200%_100%] animate-pulse rounded"></div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index + activeTab} className="text-white/60 px-4">
            <div
              className="response"
              dangerouslySetInnerHTML={{ __html: message.text }}
            />
            <div className="w-full text-center">
              {isReport && routeBred === 'default' && (
                <button
                  className="text-sm font-semibold leading-tight text-white/87 text-center border-0 outline-0 bg-transparent m-0 mb-5"
                  onClick={onReport}
                >
                  Báo cáo vấn đề ?
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
