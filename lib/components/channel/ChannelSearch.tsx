import { ChannelPageContext } from '@/pages/xem-truyen-hinh/[id]';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import slug from 'slug';
import ChannelSearchDropdownItem from './ChannelSearchDropdownItem';
import styles from './ChannelSearch.module.css';

export default function ChannelSearch() {
  const ctx = useContext(ChannelPageContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    searchKey,
    channelPageData,
    setIsSearch,
    setSearchKey,
    setChannelsBySearchKeyShown,
  } = ctx;
  
  // Separate input value from search key that drives results
  const [inputValue, setInputValue] = useState(searchKey || '');
  const [canShowDropdown, setCanShowDropdown] = useState(false);

  // Sync input value with search key when search key changes externally
  useEffect(() => {
    setInputValue(searchKey || '');
  }, [searchKey]);

  // Kiểm tra input có hợp lệ không (không chỉ có space hoặc special characters)
  const isValidSearchInput = (input: string) => {
    if (!input || input.trim() === '') return false;

    // Kiểm tra có ký tự hợp lệ không (chữ cái, số, tiếng Việt)
    const validPattern =
      /[a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/;
    return validPattern.test(input);
  };

  // Use inputValue for dropdown filtering, not searchKey
  const channelsBySearchKeyForDropdown = useMemo(() => {
    if (!inputValue || !isValidSearchInput(inputValue)) {
      return [];
    } else {
      const slugSearchKey = slug(inputValue, '-');
      const plusSearchKey = slug(inputValue, '+');
      const searchKeyNoWhiteSpace = slug(inputValue, '');
      return channelPageData?.channels?.filter((cn) => {
        return (
          cn?.slugName?.includes(slugSearchKey) ||
          cn?.plusName?.includes(plusSearchKey) ||
          cn?.nameNoWhiteSpace?.includes(searchKeyNoWhiteSpace)
        );
      });
    }
  }, [inputValue, channelPageData]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef.current]);

  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Enter') {
      setCanShowDropdown(false);
      
      // Update search key and results only on Enter
      if (setSearchKey) {
        setSearchKey(inputValue);
      }
      
      if (setChannelsBySearchKeyShown) {
        // If empty string, show all channels
        if (!inputValue || inputValue.trim() === '') {
          setChannelsBySearchKeyShown(channelPageData?.channels || []);
        } else {
          const results = channelsBySearchKeyForDropdown || [];
          setChannelsBySearchKeyShown(results);
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // Only update input value, not search key
    setCanShowDropdown(true);
  };

  return (
    <div className="relative">
      {/* input */}
      <div
        className={`relative border-[2px] border-black-olive rounded-[16px] overflow-hidden w-[576px] max-w-full ${styles.form}`}
      >
        <button
          aria-label="Search"
          className="hover:cursor-pointer absolute left-[8px] top-1/2 -translate-y-1/2"
          onClick={() => {
            if (setIsSearch) {
              setIsSearch(false);
            }
          }}
        >
          <IoMdClose className="text-[24px] text-white-smoke duration-300 ease-out hover:text-fpl" />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm kênh"
          className="nvm-input w-full px-[40px] py-[12px] text-[18px] font-[500] leading-[130%] tracking-[0.36px] text-white-smoke placeholder:font-[400] placeholder:text-spanish-gray"
          value={inputValue}
          onChange={handleInputChange}
          onKeyUp={onKeyUp}
        />
      </div>
      {/* dropdown */}

      {canShowDropdown &&
      channelsBySearchKeyForDropdown &&
      channelsBySearchKeyForDropdown?.length > 0 ? (
        <div
          className={`ChannelSearchDropdownItem absolute left-0 top-[calc(100%_+_8px)] bg-eerie-black rounded-[16px] max-h-[384px] z-3 w-[calc(100vw_-_32px)] tablet:w-[576px] overflow-y-auto ${styles.dropdown}`}
        >
          {channelsBySearchKeyForDropdown.map((cn, index) => (
            <ChannelSearchDropdownItem
              key={index}
              channel={cn}
              onClickChannel={() => setCanShowDropdown(false)}
            />
          ))}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
