import React from 'react';
import { DELETE_HISTORY_TEXT, DELETE_TEXT } from '@/lib/constant/texts';
import { removeVietnameseTones } from '@/lib/utils/removeVietnameseTones';
import { IoIosSearch } from 'react-icons/io';
import { FaClockRotateLeft } from 'react-icons/fa6';
import styles from './Scrollbar.module.css';

type SuggestKeyword = {
  keyword?: string;
  logo?: string;
  logo_focus?: string;
  is_history?: boolean;
};

type SuggestListProps = {
  suggestKeywords: SuggestKeyword[];
  trendKeywords: SuggestKeyword[];
  keyword: string;
  onSuggestedKeywordClick: (title: string) => void;
  onDeleteHistory: (keyword: string) => void;
  isFocused: boolean;
};

const SuggestList = ({
  suggestKeywords,
  keyword,
  onSuggestedKeywordClick,
  onDeleteHistory,
  isFocused,
  trendKeywords,
}: SuggestListProps) => {
  if (!isFocused) return null;

  const showSuggest = keyword.trim().length > 0 && suggestKeywords.length > 0;
  const showTrend = keyword.trim().length === 0 && trendKeywords.length > 0;
  if (!showSuggest && !showTrend) return null;

  const renderItem = (item: SuggestKeyword, index: number) => {
    const text = item.keyword || '';
    const isHistory = item.is_history || false;
    const trimmedKeyword = keyword.trim();
    const highlightLength = trimmedKeyword.length;

    const normalizedText = removeVietnameseTones(text).toLowerCase();
    const normalizedKeyword =
      removeVietnameseTones(trimmedKeyword).toLowerCase();

    const startsWithKeyword =
      normalizedText.slice(0, highlightLength) === normalizedKeyword;

    const firstPart = startsWithKeyword ? text.slice(0, highlightLength) : '';
    const remainingPart = startsWithKeyword
      ? text.slice(highlightLength)
      : text;

    return (
      <li
        key={`${text}-${index}-${isHistory}`}
        className="hover:bg-charleston-green cursor-pointer flex justify-between items-center px-4 py-3 gap-2"
        onClick={() => onSuggestedKeywordClick(text)}
      >
        <div className="flex flex-1 items-center min-w-0">
          <div className="flex items-center gap-3 text-white w-full overflow-hidden">
            {isHistory ? (
              item.logo ? (
                <img
                  src={item.logo}
                  alt="History logo"
                  className="w-[24px] h-[24px] object-contain"
                />
              ) : (
                <FaClockRotateLeft className="w-[24px] h-[18px]" />
              )
            ) : (
              item.logo ? (
                <img
                  src={item.logo}
                  alt="Search logo"
                  className="w-[24px] h-[24px] object-contain"
                />
              ) : (
                <IoIosSearch className="w-[24px] h-[24px]" />
              )
            )}
            <div className="truncate w-full max-w-[92%]">
              {firstPart && (
                <span className="text-spanish-gray">{firstPart}</span>
              )}
              <span>{remainingPart}</span>
            </div>
          </div>
        </div>

        {isHistory && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDeleteHistory(text);
            }}
            className="text-spanish-gray hover:text-fpl cursor-pointer select-none text-[12px] md:text-[14px] flex-shrink-0"
            title={DELETE_HISTORY_TEXT}
          >
            {DELETE_TEXT}
          </span>
        )}
      </li>
    );
  };

  return (
    <div className={`absolute left-0 right-0 z-5 ${styles.suggestScrollbar}`}>
      <div
        className={`suggest-scrollbar mx-auto z-1 max-w-[848px]
          bg-eerie-black rounded-[16px] mt-2 text-[15px] 2xl:text-[18px] overflow-hidden max-h-[280px]
           2xl:max-h-[480px] overflow-y-auto`}
      >
        <ul>
          {(showSuggest ? suggestKeywords : trendKeywords).map((child, index) =>
            child.keyword ? renderItem(child, index) : null,
          )}
        </ul>
      </div>
    </div>
  );
};

export default React.memo(SuggestList);
