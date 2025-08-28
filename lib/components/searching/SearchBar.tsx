import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import {
  FIND_TEXT,
  PROFILE_TYPES,
  SEARCH_PLACEHOLDER,
} from '@/lib/constant/texts';
import { useAppSelector } from '@/lib/store';
import { AppContext } from '../container/AppContainer';
import { useChatbot } from '@/lib/hooks/useChatbot';

type SearchFormProps = {
  keyword: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e: React.FormEvent) => void;
  resetInput: () => void;
  isActive: boolean;
  handleInputFocus: () => void;
};

const SearchingBar = ({
  keyword,
  onInputChange,
  onSearch,
  resetInput,
  isActive,
  handleInputFocus,
}: SearchFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { clickChatbot } = useChatbot();
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const { configs } = useContext(AppContext);
  const { info } = useAppSelector((s) => s.user);
  const isShowChatbot = useMemo(() => {
    return (
      configs?.chat_bot_search?.enable === '1' &&
      info?.chatbot === '1' &&
      info?.profile?.profile_type === PROFILE_TYPES.MASTER_PROFILE
    );
  }, [info, configs]);

  const searchPlaceholder = useMemo(() => {
    if (isShowChatbot) {
      return 'Hỏi trợ lý Gati hoặc tìm kiếm';
    }
    return `${SEARCH_PLACEHOLDER}...`;
  }, [isShowChatbot]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex items-center max-w-[912px] h-[48px] sm:h-[58px] md:h-[74px] gap-[12px] md:gap-[16px] bg-eerie-black rounded-[104px] mx-auto px-[16px] md:px-[24px] py-2 md:py-4 box-border">
      {isShowChatbot ? (
        <button className="hover:cursor-pointer" onClick={clickChatbot}>
          <img
            src={configs?.chat_bot_search?.icon || '/images/logo_chat.png'}
            alt="chatbot"
            width={24}
            height={24}
            className="md:w-[32px] md:h-[32px]"
          />
        </button>
      ) : (
        <IoIosSearch className="w-[22px] h-[22px] lg:w-[24px] lg:h-[24px] shrink-0" />
      )}

      <input
        ref={inputRef}
        value={keyword}
        onChange={onInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={`${searchPlaceholder}`}
        className="bg-transparent placeholder-black-olive-404040 text-white border-none focus:outline-none flex-1 text-[14px] sm:text-base xl:text-[20px] overflow-hidden text-ellipsis whitespace-nowrap placeholder:text-[14px] sm:placeholder:text-base xl:placeholder:text-[20px]"
      />

      <div className="min-w-[18px] h-[18px] 2xl:w-[24px] 2xl:h-[24px]">
        {isActive && (
          <div
            onClick={() => {
              resetInput();
              // keep focus in the input after clearing
              inputRef.current?.focus();
            }}
            className="cursor-pointer text-spanish-gray"
          >
            <IoClose className="w-[18px] h-[18px] lg:w-[24px] lg:h-[24px] shrink-0" />
          </div>
        )}
      </div>

      <button
        onClick={onSearch}
        className={`flex items-center justify-center ml-auto h-[32px] sm:h-[36px] md:h-[42px] min-w-[60px] sm:min-w-[80px] md:w-[120px] 2xl:w-[135px] rounded-[104px] 
          font-semibold text-[10px] sm:text-xs md:text-base 2xl:text-[20px] px-2 2xl:px-6 py-1 md:py-2 box-border ${
            isActive
              ? 'fpl-bg text-white cursor-pointer'
              : 'bg-charleston-green text-spanish-gray'
          }`}
      >
        {FIND_TEXT}
      </button>
    </div>
  );
};

export default React.memo(SearchingBar);
