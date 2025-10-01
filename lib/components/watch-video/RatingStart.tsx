import { useState, useEffect, useMemo } from 'react';
import { FaStar } from 'react-icons/fa';
import { RootState, useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { showToast } from '@/lib/utils/globalToast';
import { postRatingData, RatingData } from '@/lib/api/video';
import { HighlightedInfo } from './InforVideoComponent';
import { useSelector } from 'react-redux';
import { AxiosError } from 'axios';

interface RatingStarProps {
  itemId: string;
  refId?: string;
  appId?: string;
  totalStars?: number;
  ratingInfo?: RatingData;
  loadRating?: () => void;
}

const RatingStar: React.FC<RatingStarProps> = ({
  itemId,
  refId = '',
  appId = '',
  totalStars = 5,
  ratingInfo,
  loadRating,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [isEditRating, setIsEditRating] = useState(false);

  const dispatch = useAppDispatch();
  const { isLogged } = useAppSelector((state) => state.user);

  const messageConfigs = useSelector(
    (state: RootState) => state.app.messageConfigs,
  );

  const showToastSafely = (title: string, desc: string) => {
    try {
      showToast({ title, desc });
    } catch {}
  };

  const generalInfoMessage = useMemo(
    () => ({
      rating_content: {
        action_edit: messageConfigs?.rating_content?.action_edit || 'Chỉnh sửa',
        action_cancel: messageConfigs?.rating_content?.action_cancel || 'Hủy',
        action_no_rating:
          messageConfigs?.rating_content?.action_no_rating ||
          'Chưa có đánh giá',
        hover_message: {
          five_star:
            messageConfigs?.rating_content?.hover_message?.five_star ||
            'Rất đáng xem',
          four_star:
            messageConfigs?.rating_content?.hover_message?.four_star || 'Hay',
          three_star:
            messageConfigs?.rating_content?.hover_message?.three_star || 'Ổn',
          two_star:
            messageConfigs?.rating_content?.hover_message?.two_star ||
            'Chưa hay lắm',
          one_star:
            messageConfigs?.rating_content?.hover_message?.one_star ||
            'Cần cải thiện',
        },
      },
    }),
    [messageConfigs],
  );

  useEffect(() => {
    if (!itemId || !refId) return;
    if (
      ratingInfo?.user?.rate &&
      parseInt(ratingInfo?.user?.rate, 10) > 0 &&
      parseInt(ratingInfo?.user?.rate, 10) <= totalStars
    ) {
      setRating(parseInt(ratingInfo?.user?.rate, 10));
    } else {
      setRating(0);
    }
    setIsEditRating(false);
    setHover(null);
  }, [itemId, refId, ratingInfo, totalStars]);

  const handleRatingVod = async (starValue: number) => {
    if (!isLogged) {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      return;
    }

    try {
      const res = await postRatingData({
        itemId,
        refId,
        appId,
        rating: starValue,
      });

      if (res?.status === '1') {
        showToastSafely(
          res?.message?.title || 'Gửi đánh giá thành công',
          res?.msg || 'Cảm ơn bạn đã đánh giá nội dung này',
        );
        if (isEditRating) {
          setIsEditRating(false);
        }
        setRating(starValue);
        loadRating?.();
      } else {
        showToastSafely(
          res?.message?.title ||
            res?.data?.title ||
            'Gửi đánh giá không thành công',
          res?.message?.content ||
            res?.data?.msg ||
            'Đã có lỗi xảy ra, vui lòng thử lại sau',
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        showToastSafely(
          error.response?.data?.message?.title ||
            error.response?.data?.data?.title ||
            'Gửi đánh giá không thành công',
          error.response?.data?.message?.content ||
            error.response?.data?.data?.msg ||
            'Đã có lỗi xảy ra, vui lòng thử lại sau',
        );
      }
    }
  };

  const handleHoverStar = (starValue: number) => {
    setHover(starValue);
  };

  const handleUnHoverStar = () => {
    setHover(null);
  };

  const isNotEmptyObject = (obj: HighlightedInfo | null) => {
    return obj && Object.keys(obj)?.length > 0 && obj.constructor === Object;
  };

  const hightlightInfo = useMemo(() => ratingInfo?.content?.[0], [ratingInfo]);
  const bgColor = useMemo(
    () => hightlightInfo?.bg_color || hightlightInfo?.bg || '#2C2C2C',
    [hightlightInfo],
  );

  if (!isNotEmptyObject(hightlightInfo as HighlightedInfo | null)) {
    return null;
  }

  return (
    <div className="flex h-[32px]">
      {!hightlightInfo?.avg_rate && !isEditRating && !rating && (
        <div
          className="flex items-center gap-2 p-2 rounded-[8px] mr-3 border border-white/10"
          style={{
            backgroundColor: bgColor,
          }}
        >
          <FaStar size={18} className="text-fpl" />
          <p className="text-spanish-gray text-base font-[450] leading-[130%] mt-[2px] whitespace-nowrap">
            {generalInfoMessage.rating_content.action_no_rating}
          </p>
        </div>
      )}

      {rating > 0 && !isEditRating && (
        <div className="flex items-center gap-2">
          <FaStar size={18} className="text-fpl" />
          <span className="text-white text-base font-bold">{rating}</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full mx-1" />
          <span
            className="text-fpl cursor-pointer text-sm font-semibold mt-[2px]"
            onClick={() => setIsEditRating(true)}
          >
            {generalInfoMessage.rating_content.action_edit}
          </span>
        </div>
      )}

      {(String(rating) === '0' || isEditRating) && (
        <div className="flex items-center space-x-1 mt-1">
          {Array.from({ length: totalStars }, (_, index) => {
            const starValue = index + 1;
            return (
              <div key={starValue} className="item relative group">
                <button
                  type="button"
                  onClick={() => handleRatingVod(starValue)}
                  onMouseEnter={() => handleHoverStar(starValue)}
                  onMouseLeave={handleUnHoverStar}
                  className="hover:scale-110 transition-transform hover:cursor-pointer"
                >
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:inline-block bg-charleston-green text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                    {starValue === 1
                      ? generalInfoMessage.rating_content.hover_message.one_star
                      : starValue === 2
                      ? generalInfoMessage.rating_content.hover_message.two_star
                      : starValue === 3
                      ? generalInfoMessage.rating_content.hover_message
                          .three_star
                      : starValue === 4
                      ? generalInfoMessage.rating_content.hover_message
                          .four_star
                      : generalInfoMessage.rating_content.hover_message
                          .five_star}
                  </div>
                  <FaStar
                    size={18}
                    className={`${
                      starValue <= (hover ?? rating)
                        ? 'text-fpl'
                        : 'text-black-olive-404040'
                    } transition-colors`}
                  />
                </button>
              </div>
            );
          })}
          {isEditRating && (
            <span
              className="text-fpl cursor-pointer text-sm ml-2 mt-[0px] font-semibold"
              onClick={() => setIsEditRating(false)}
            >
              {generalInfoMessage.rating_content.action_cancel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingStar;
