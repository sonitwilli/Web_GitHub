import React from 'react';
import { FaClockRotateLeft } from 'react-icons/fa6';

type SuggestKeyword = {
  keyword?: string;
  logo?: string;
  logo_focus?: string;
};

type TrendKeywordsProps = {
  keyword: SuggestKeyword[];
  onKeywordClick: (keyword: string) => void;
};

const TrendKeywords = ({ keyword, onKeywordClick }: TrendKeywordsProps) => {
  if (keyword.length === 0) return null;
  return (
    <div className="w-full mx-auto max-w-[848px] mt-2 text-base">
      <ul className="flex flex-col gap-2 mt-6">
        {keyword.map((item, i) => (
          <li key={i}>
            {item.keyword && (
              <div className="block">
                <div
                  className="flex items-center gap-3 text-white rounded-full
                   w-full overflow-hidden "
                >
                  <div
                    onClick={() => item.keyword && onKeywordClick(item.keyword)}
                    className="flex items-center gap-3 overflow-hidden px-4 py-3 rounded-full bg-eerie-black hover:bg-charleston-green
                    hover:shadow-md transition duration-300 ease-in-out cursor-pointer"
                  >
                    {item.logo ? (
                      <img
                        className="shrink-0"
                        src={item.logo}
                        width={18}
                        height={18}
                        alt="Logo"
                      />
                    ) : (
                      <FaClockRotateLeft className="w-[16px] h-[18px]" />
                    )}
                    <span className="truncate flex-1">{item.keyword}</span>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(TrendKeywords);
