import useClickOutside from '@/lib/hooks/useClickOutside';
import { IoClose } from 'react-icons/io5';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutsideClick } from '@/lib/hooks/useOutsideClick';
import { usePreventOuterScroll } from '@/lib/hooks/usePreventOuterScroll';
import { useAppSelector } from '@/lib/store';
import { useNotification } from '../../hooks/useNotification';
import { useNetwork } from '../contexts/NetworkProvider';
import NotificationItem from './NotificationItem';
import NotificationDetail from './NotificationDetail';
import ReadAll from '../svg/ReadAll';
import styles from './DropdownNoti.module.css';
import {
  CategoryItem,
  InboxListItem,
  InboxDetailItem,
  onMarkReadCategoryInbox,
} from '../../api/notification';
import { RiArrowLeftLine } from 'react-icons/ri';
import { showToast } from '@/lib/utils/globalToast';
import {
  DEFAULT_ERROR_MSG,
  INFORM,
  READ,
  ERROR_CONNECTION,
} from '@/lib/constant/texts';
import Spinner from '../svg/Spinner';

export type NotificationStatusType = 'all' | 'unread' | 'read';
export type LoadInboxFn = (
  page: number,
  append: boolean,
  category: string,
  status: NotificationStatusType,
) => Promise<void>;

// Biến cache ngoài component
let cachedCategories: CategoryItem[] | null = null;

export default function DropdownNoti({
  onClose,
  onAllRead,
}: {
  onClose: () => void;
  onAllRead?: (isAllRead: boolean) => void;
}) {
  const { fetchCategories, fetchInbox, markRead } = useNotification();
  const { info } = useAppSelector((state) => state.user);
  const { isOffline } = useNetwork();

  const notiModalRef = useClickOutside<HTMLDivElement>(onClose, [
    'notification-bell-button',
  ]);
  const dropdownFilterRef = useRef<HTMLDivElement>(null);
  const dropdownStatusRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownFilterRef, () => setDropdownFilterOpen(false));
  useOutsideClick(dropdownStatusRef, () => setDropdownStatusOpen(false));

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [inboxList, setInboxList] = useState<InboxListItem[]>([]);
  const [inboxDetail, setInboxDetail] = useState<InboxDetailItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] =
    useState<NotificationStatusType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [dropdownFilterOpen, setDropdownFilterOpen] = useState(false);
  const [dropdownStatusOpen, setDropdownStatusOpen] = useState(false);

  const statuses = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chưa đọc', value: 'unread' },
    { label: 'Đã đọc', value: 'read' },
  ];

  useEffect(() => {
    if (cachedCategories) {
      setCategories(cachedCategories);
    } else {
      (async () => {
        try {
          const cats = await fetchCategories();
          // Đảm bảo cats là array và có ít nhất 1 item
          if (Array.isArray(cats) && cats.length > 0) {
            setCategories(cats);
            cachedCategories = cats;
          } else {
            // Nếu không có categories, set empty array để UI hiển thị "không có items"
            setCategories([]);
            cachedCategories = [];
          }
        } catch {
          // Nếu có lỗi, set empty array
          setCategories([]);
          cachedCategories = [];
        }
      })();
    }
  }, [fetchCategories]);

  const loadInbox: LoadInboxFn = useCallback(
    async (
      page: number,
      append: boolean,
      category: string,
      status: NotificationStatusType,
    ) => {
      // check loading ngay trong hàm, không đưa vào deps
      if (loading) return;

      setLoading(true);
      try {
        const res = await fetchInbox({
          page,
          category_id: category !== 'all' ? category : undefined,
          status: status !== 'all' ? status : undefined,
        });

        if (res) {
          setInboxList((prev) => (append ? [...prev, ...res.data] : res.data));
          setHasMore(res.data.length >= 10);
          setCurrentPage(page);
        }
      } catch {
        showToast({
          title: ERROR_CONNECTION,
          desc: DEFAULT_ERROR_MSG,
        });
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchInbox], // Không truyền loading
  );

  usePreventOuterScroll(listRef);

  useEffect(() => {
    (async () => {
      // Fetch page 1
      const res = await fetchInbox({
        page: 1,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });

      if (res) {
        setInboxList(res.data);
        setHasMore(res.data.length >= 10);
        setCurrentPage(1);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    if (inboxList.length > 0 && inboxList.every((i) => i.status === 'read')) {
      onAllRead?.(true);
    }
  }, [inboxList, onAllRead]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (nearBottom && hasMore && !loading) {
      loadInbox(currentPage + 1, true, selectedCategory, selectedStatus);
    }
  };

  const handleClickItem = async (item: InboxListItem) => {
    // Check if offline first
    if (isOffline) {
      showToast({
        title: ERROR_CONNECTION,
        desc: DEFAULT_ERROR_MSG,
      });
      return;
    }

    // Open new tab
    if (item.url) {
      const separator = item.url.includes('?') ? '&' : '?';
      window.open(`${item.url}${separator}`, '_blank');

      // Local update inboxList: 'read'
      setInboxList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'read' } : i)),
      );

      // Call API mark read
      await markRead([item.id ?? '']);

      // Reload list
      loadInbox(1, false, selectedCategory, selectedStatus);
    } else {
      handleShowDetail(item);
    }
  };

  const handleShowDetail = async (item: InboxListItem) => {
    // Check if offline first
    if (isOffline) {
      showToast({
        title: ERROR_CONNECTION,
        desc: DEFAULT_ERROR_MSG,
      });
      return;
    }

    setInboxDetail({ ...item });

    // Local update inboxList: 'read'
    setInboxList((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'read' } : i)),
    );

    // Call API mark read
    await markRead([item.id ?? '']);

    // Reload list
    loadInbox(1, false, selectedCategory, selectedStatus);
  };

  if (!info?.user_id_str) {
    onClose();
    return null;
  }

  const handleMarkReadCategory = async () => {
    // Check if offline first
    if (isOffline) {
      showToast({
        title: ERROR_CONNECTION,
        desc: DEFAULT_ERROR_MSG,
      });
      return;
    }

    try {
      const res = await onMarkReadCategoryInbox({
        category_id: selectedCategory,
      });

      if (res.data?.status === 1) {
        showToast({
          title: INFORM,
          desc: READ,
        });
        // Local update
        setInboxList((prev) => {
          const updated = prev.map((i) => ({ ...i, status: 'read' }));
          onAllRead?.(true);
          return updated;
        });
        // Optionally: reload with server
        loadInbox(1, false, selectedCategory, selectedStatus);
      } else {
        showToast({
          title: ERROR_CONNECTION,
          desc: DEFAULT_ERROR_MSG,
        });
      }
    } catch {
      showToast({
        title: ERROR_CONNECTION,
        desc: DEFAULT_ERROR_MSG,
      });
    }
  };

  return (
    <div
      ref={notiModalRef}
      className={`absolute top-[-2px] tablet:top-10 xl:top-[calc(100%+28px)] right-[-108px] tablet:left-[-50px] xl:left-1/2 tablet:-translate-x-1/2 z-50 w-[calc(100vw-2px)] h-[calc(100vh-2px)] tablet:w-[480px] tablet:h-[813px] bg-eerie-black tablet:rounded-2xl shadow-xl flex flex-col overflow-hidden border border-charleston-green`}
    >
      <div className="flex justify-between items-center p-4">
        {inboxDetail ? (
          <>
            <div className="flex">
              <button
                onClick={() => setInboxDetail(null)}
                className="text-white-smoke cursor-pointer mr-4"
              >
                <RiArrowLeftLine size={24} />
              </button>
              <h2 className="text-lg font-bold text-white-smoke">
                Chi tiết thông báo
              </h2>
            </div>
            <IoClose
              onClick={onClose}
              size={24}
              className="text-spanish-gray cursor-pointer hover:fill-fpl"
            />
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-white-smoke">THÔNG BÁO</h2>
            <IoClose
              onClick={onClose}
              size={24}
              className="text-spanish-gray cursor-pointer hover:fill-fpl"
            />
          </>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-2">
          <Spinner size={59} />
        </div>
      )}

      {inboxDetail ? (
        <NotificationDetail
          data={inboxDetail}
          onClose={() => setInboxDetail(null)}
        />
      ) : (
        <>
          <div className="flex flex-row items-end justify-between tablet:justify-normal p-4 gap-4 w-full border-b border-charleston-green">
            {/* Category Filter */}
            <div
              className="relative w-[143px] tablet:w-[196px]"
              ref={dropdownFilterRef}
            >
              <span className="text-[14px] tablet:text-[16px] text-spanish-gray">
                Loại thông báo
              </span>
              <button
                onClick={() => setDropdownFilterOpen((prev) => !prev)}
                className={`
                  flex items-center justify-between
                  w-[143px] tablet:w-[196px] h-[40px]
                  px-[12px] py-[8px] gap-[8px]
                  border rounded-[8px]
                  mt-2
                  ${
                    dropdownFilterOpen
                      ? 'border-davys-grey'
                      : 'border-black-olive-404040'
                  }
                  hover:border-davys-grey
                  cursor-pointer
                  transition-colors duration-200
                  outline-none
                `}
              >
                <span
                  className="text-[14px] font-normal leading-[130%] tracking-[0.02em] text-white-smoke truncate text-left w-full"
                  style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.25)' }}
                >
                  {selectedCategory === 'all'
                    ? 'Tất cả'
                    : categories.find((c) => c.id === selectedCategory)?.name ||
                      'Chọn loại'}
                </span>

                <MdOutlineKeyboardArrowDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    dropdownFilterOpen ? 'rotate-180' : ''
                  } text-white-smoke`}
                />
              </button>
              {dropdownFilterOpen && (
                <div className="absolute top-full mt-1 w-full rounded-[8px] bg-black-olive-404040 shadow-lg z-10 overflow-hidden">
                  {(!categories || categories.length === 0) && (
                    <div
                      className={`flex justify-between items-center px-3 py-2 h-[40px] cursor-pointer text-[14px] ${
                        selectedCategory === 'all'
                          ? 'bg-black-olive-404040 text-white'
                          : 'text-white-smoke'
                      } hover:bg-davys-grey`}
                      onClick={() => {
                        setSelectedCategory('all');
                        setDropdownFilterOpen(false);
                      }}
                    >
                      <span>Tất cả</span>
                      {selectedCategory === 'all' && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                  )}

                  {categories &&
                    categories.length &&
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`flex justify-between items-center px-3 py-2 h-[40px] cursor-pointer text-[14px] ${
                          selectedCategory === cat.id
                            ? 'bg-black-olive-404040 text-white'
                            : 'text-white-smoke'
                        } hover:bg-davys-grey`}
                        onClick={() => {
                          setSelectedCategory(cat.id ?? '');
                          setDropdownFilterOpen(false);
                        }}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory === cat.id && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div
              className="relative w-[143px] tablet:w-[196px]"
              ref={dropdownStatusRef}
            >
              <span className="text-[14px] tablet:text-[16px] text-spanish-gray">
                Trạng thái
              </span>
              <button
                onClick={() => setDropdownStatusOpen((prev) => !prev)}
                type="button"
                className={`
                  flex items-center justify-between
                  w-[143px] tablet:w-[196px] h-[40px]
                  px-[12px] py-[8px] gap-[8px]
                  border rounded-[8px]
                  ${
                    dropdownStatusOpen
                      ? 'border-davys-grey'
                      : 'border-black-olive-404040'
                  }
                  hover:border-davys-grey
                  cursor-pointer mt-2
                  transition-colors duration-200
                  outline-none
                `}
              >
                <span
                  className="text-[14px] font-normal leading-[130%] tracking-[0.02em] text-white-smoke truncate text-left w-full"
                  style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.25)' }}
                >
                  {statuses.find((s) => s.value === selectedStatus)?.label}
                </span>

                <MdOutlineKeyboardArrowDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    dropdownStatusOpen ? 'rotate-180' : ''
                  } text-white-smoke`}
                />
              </button>

              {dropdownStatusOpen && (
                <div className="absolute top-full mt-1 w-full rounded-[8px] bg-black-olive-404040 shadow-lg z-10 overflow-hidden">
                  {statuses.map((status) => (
                    <div
                      key={status.value}
                      className={`flex justify-between items-center px-3 py-2 h-[40px] cursor-pointer text-[14px] ${
                        selectedStatus === status.value
                          ? 'bg-black-olive-404040 text-white'
                          : 'text-white-smoke'
                      } hover:bg-davys-grey`}
                      onClick={() => {
                        setSelectedStatus(
                          status.value as NotificationStatusType,
                        );
                        setDropdownStatusOpen(false);
                      }}
                    >
                      <span>{status.label}</span>
                      {selectedStatus === status.value && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="relative group w-6 h-6 mb-2 cursor-pointer"
              onClick={handleMarkReadCategory}
            >
              <ReadAll />
              <div
                className="
                absolute z-1
                right-0 top-full mt-[12px]
                flex flex-row justify-center items-center
                px-2 py-1
                w-[167px] h-[26px]
                bg-charleston-green
                rounded
                text-white-smoke
                text-[14px] leading-[130%] font-normal
                tracking-[0.02em]
                shadow
                opacity-0 group-hover:opacity-100
                pointer-events-none
                transition-opacity duration-200
                select-none
                whitespace-nowrap
              "
              >
                Đánh dấu tất cả đã đọc
              </div>
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className={`flex-1 overflow-y-auto overflow-x-hidden ${styles.scrollBar} relative pr-1`}
          >
            {inboxList.length > 0 ? (
              inboxList.map((item, index) => {
                const isLast = index === inboxList.length - 1;
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      item.body && item.body.length < 65
                        ? handleClickItem(item)
                        : ''
                    }
                    className={isLast && !hasMore ? 'mb-6' : ''}
                  >
                    <NotificationItem
                      data={item}
                      onShowDetail={() => handleShowDetail(item)}
                    />
                  </div>
                );
              })
            ) : (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[80%] flex flex-col items-center gap-6">
                <img
                  src="/images/non_mailbox_noti.png"
                  alt="no notifications"
                  className="w-[190px] h-[130px]"
                />
                <p className="text-white-smoke text-[16px] font-normal leading-[130%]">
                  Không có thông báo hiển thị
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 w-full h-[60px] pointer-events-none z-10">
        <img
          src="/images/svg/shadow_noti.svg"
          alt="shadow"
          className="w-full h-full rounded-bl-2xl rounded-br-2xl"
        />
      </div>
    </div>
  );
}
