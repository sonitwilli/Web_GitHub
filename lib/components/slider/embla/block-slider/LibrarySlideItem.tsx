import React, { useRef } from 'react';
import {
  BlockItemType,
  BlockSlideItemType,
  PageMetaType,
} from '@/lib/api/blocks';
import BlockSlideItem from '../../BlockSlideItem';

type PropType = {
  slide?: BlockSlideItemType;
  block?: BlockItemType;
  index?: number;
  metaBlock?: PageMetaType;
  isChecked?: boolean;
  isSelectionMode?: boolean;
  onCheckboxChange?: (index: number, checked: boolean) => void;
};

const LibrarySlideItem: React.FC<PropType> = (props) => {
  const {
    block,
    slide,
    index = 0,
    metaBlock,
    isSelectionMode,
    isChecked = false,
    onCheckboxChange,
  } = props;
  const slideRef = useRef<HTMLDivElement>(null);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckboxChange) {
      onCheckboxChange(index, e.target.checked);
    }
  };

  const handleDivClick = () => {
    if (onCheckboxChange) {
      onCheckboxChange(index, !isChecked);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCheckboxChange) {
      onCheckboxChange(index, !isChecked);
    }
  };

  return (
    <div
      ref={slideRef}
      className="embla__slide transition-all duration-300 hover:scale-[1.05]"
    >
      {isSelectionMode && (
        <div
          onClick={handleDivClick}
          className="absolute cursor-pointer top-0 z-[2] w-[calc(100%-16px)] h-[calc(100%-34px)] bg-black-05 rounded-2xl"
        >
          <label
            className="mr-2 cursor-pointer absolute z-[1] top-[11px] right-0 left-auto"
            onClick={handleLabelClick}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="opacity-0 absolute w-0 h-0"
              aria-label={`Select slide ${index}`}
            />
            <span
              className={`w-[18px] h-[18px] rounded-[3px] border flex items-center justify-center transition-all duration-200 ${
                isChecked ? 'bg-fpl border border-fpl' : 'bg-transparent'
              }`}
            >
              {isChecked && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
          </label>
        </div>
      )}
      <div
        onClick={handleDivClick}
        className="absolute bottom-0 z-[2] w-[calc(100%-16px)] h-[47px]"
      ></div>
      <BlockSlideItem
        block={block}
        slide={slide}
        index={index}
        metaBlock={metaBlock}
        styleTitle="mt-[8px] mb-0 line-clamp-1 w-full text-[16px] font-[500]"
      />
    </div>
  );
};

export default LibrarySlideItem;
