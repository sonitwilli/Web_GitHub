import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { BlockItemType } from '@/lib/api/blocks';
import debounce from 'lodash/debounce';
import dynamic from 'next/dynamic';
import useClickOutside from '@/lib/hooks/useClickOutside';
import { fetchBlocks, fetchSuggestKeywords, removeSearchHistory, SuggestKeyword } from '@/lib/api/search';
import { NO_RESULT_FOUNDED, TRY_OTHER_CONTENT } from '@/lib/constant/texts';
import Spinner from '@/lib/components/svg/Spinner';
import SuggestList from './SuggestKeyword';

//const TrendKeywords = dynamic(() => import('./TrendKeyword'), { ssr: false });
const SearchingBar = dynamic(() => import('./SearchBar'), { ssr: false });
const BlockVideo = dynamic(() => import('./BlockVideo'), { ssr: false });

const SearchingPage = () => {
  const router = useRouter();
  
  const query = router.query;

  const [keyword, setKeyword] = useState<string>('');
  const [suggestKeywords, setSuggestKeywords] = useState<SuggestKeyword[]>([]);
  const [trendKeywords, setTrendKeywords] = useState<SuggestKeyword[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<BlockItemType[]>([]);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [allBlocksEmpty, setAllBlocksEmpty] = useState<boolean>(false);

  const isActive = keyword.trim() !== '';

  // search bằng nút tìm kiếm
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      setLoading(true);
      const url = `/tim-kiem?k=${encodeURIComponent(trimmedKeyword)}`;
      router.push(url);
      setSuggestKeywords([]);
      setIsFocused(false);
    }
  };
  // search bằng đề xuất
  const onSuggestedKeywordClick = (title: string) => {
    setKeyword(title);
    setIsFocused(false);
    setSuggestKeywords([]);
    const encodedTitle = encodeURIComponent(title);
    router.push(`/tim-kiem?k=${encodedTitle}`);
  };

  const onDeleteHistory = async (keyword: string) => {
    try {
      const success = await removeSearchHistory(keyword);
      if (success) {
        // Remove the deleted item from suggestKeywords
        setSuggestKeywords(prev => {
          const filtered = prev.filter(item => item.keyword !== keyword);
          return filtered;
        });
        // Also remove from trendKeywords if it exists there
        setTrendKeywords(prev => {
          const filtered = prev.filter(item => item.keyword !== keyword);
          return filtered;
        });
      }
    } catch (error) {
      console.error('Failed to delete search history:', error);
    }
  };

  const handleFetchSuggestsKeyword = async (value: string) => {
    const results = await fetchSuggestKeywords(value);
    setSuggestKeywords(results);
  };

  const handleFetchTrendingKeyword = async () => {
    const results = await fetchSuggestKeywords();
    setTrendKeywords(results);
  };

  const updateBlocks = async (title?: string) => {
    setLoading(true);
    const result = await fetchBlocks(title);
    setBlocks(result);
    setAllBlocksEmpty(false);
    setLoading(false);
    if (title) {
      if (result.length === 0) {
        setNotFound(true);
      } else {
        setNotFound(false);
      }
    } else {
      setNotFound(false);
    }
  };

  const handleAllBlocksEmpty = (isEmpty: boolean) => {
    setAllBlocksEmpty(isEmpty);
  };

  const debouncedFetchSuggests = useRef(
    debounce((value: string) => {
      handleFetchSuggestsKeyword(value);
    }, 300),
  ).current;

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    debouncedFetchSuggests(val);
  };

  const resetInput = () => {
    setKeyword('');
    setSuggestKeywords([]);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (keyword.trim()) {
      handleFetchSuggestsKeyword(keyword);
    } else {
      handleFetchTrendingKeyword();
    }
  };

  // click để đóng suggest
  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setSuggestKeywords([]);
    setIsFocused(false);
  });

  // gọi trending word
  useEffect(() => {
    handleFetchTrendingKeyword();
  }, []);

  // set keyword từ params và update block
  useEffect(() => {
    if (typeof query.k === 'string') {
      const decoded = decodeURIComponent(query.k);
      setKeyword(decoded);
      setAllBlocksEmpty(false);
      updateBlocks(decoded);
    } else {
      setKeyword('');
      setAllBlocksEmpty(false);
      updateBlocks();
    }
  }, [router.isReady, query.k]);

  return (
    <>
      <div
        className="lg:pt-[23px] relative w-full h-auto max-w-[608px] lg:max-w-[848px] mx-auto"
        ref={containerRef}
      >
        <SearchingBar
          keyword={keyword}
          onInputChange={onInputChange}
          onSearch={onSearch}
          resetInput={resetInput}
          isActive={isActive}
          handleInputFocus={handleInputFocus}
        />

        {/* <div> */}
        <SuggestList
          trendKeywords={trendKeywords}
          isFocused={isFocused}
          suggestKeywords={suggestKeywords}
          keyword={keyword}
          onSuggestedKeywordClick={onSuggestedKeywordClick}
          onDeleteHistory={onDeleteHistory}
        />
        {/* </div> */}

        {/* {trendKeywords.length > 0 && !keyword.trim() && !isFocused && (
          <div>
            <TrendKeywords
              keyword={trendKeywords}
              onKeywordClick={onSuggestedKeywordClick}
            />
          </div>
        )} */}
      </div>

      <div className="mb-[218px]">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Spinner size={64} color="#fff" />
          </div>
        ) : (
          <>
            {(notFound || allBlocksEmpty) && (
              <div className="pl-22 pt-20 text-[28px] font-semibold w-full ">
                {typeof query.k === 'string' && (
                  <span>
                    {NO_RESULT_FOUNDED} &quot;{decodeURIComponent(query.k)}
                    &quot;. {TRY_OTHER_CONTENT}
                  </span>
                )}
              </div>
            )}

            {!query.k && <BlockVideo blocks={blocks} />}

            {blocks.length > 0 && !notFound && !allBlocksEmpty && query.k && (
              <BlockVideo
                blocks={blocks}
                keywordSearch={decodeURIComponent(String(query.k))}
                onAllBlocksEmpty={handleAllBlocksEmpty}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SearchingPage;
