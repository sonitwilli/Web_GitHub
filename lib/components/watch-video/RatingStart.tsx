import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { showToast } from '@/lib/utils/globalToast';
import { fetchRatingData, postRatingData } from '@/lib/api/video';

interface RatingStarProps {
  itemId: string;
  refId?: string;
  appId?: string;
  totalStars?: number;
}

const RatingStar: React.FC<RatingStarProps> = ({
  itemId,
  refId = '',
  appId = '',
  totalStars = 5,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [isEditRating, setIsEditRating] = useState(false);

  const dispatch = useAppDispatch();
  const { isLogged } = useAppSelector((state) => state.user);

  const generalInfoMessage = {
    rating_content: {
      action_edit: 'Chỉnh sửa',
      action_cancel: 'Hủy',
      action_no_rating: 'Chưa có đánh giá',
      hover_message: {
        five_star: 'Rất đáng xem',
        four_star: 'Hay',
        three_star: 'Ổn',
        two_star: 'Chưa hay lắm',
        one_star: 'Cần cải thiện',
      },
    },
  };

  const loadRating = async () => {
    const userRating = await fetchRatingData(itemId, refId);
    setRating(userRating);
  };

  useEffect(() => {
    if (!itemId || !refId) return;
    loadRating();
    setIsEditRating(false);
    setHover(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, refId]);

  const handleRatingVod = async (starValue: number) => {
    if (!isLogged) {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      return;
    }

    const res = await postRatingData({
      itemId,
      refId,
      appId,
      rating: starValue,
    });

    if (res?.status === '1') {
      showToast({
        title: res?.message?.title || 'Gửi đánh giá thành công',
        desc: res?.msg || 'Cảm ơn bạn đã đánh giá nội dung này',
      });
      if (isEditRating) {
        setIsEditRating(false);
      }
      setRating(starValue);
    } else {
      showToast({
        title: res?.message?.title || 'Gửi đánh giá thất bại',
        desc: res?.msg || 'Đã có lỗi xảy ra, vui lòng thử lại sau',
      });
    }
  };

  const handleHoverStar = (starValue: number) => {
    setHover(starValue);
  };

  const handleUnHoverStar = () => {
    setHover(null);
  };

  return (
    <div className="flex h-[32px]">
      {rating > 0 && !isEditRating && (
        <div className="flex items-center gap-2">
          <FaStar size={18} className="text-fpl" />
          <span className="text-white text-base font-bold">{rating}</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full mx-1" />
          <span
            className="text-fpl cursor-pointer text-sm font-semibold"
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
              className="text-fpl cursor-pointer text-sm ml-2 mt-[-5px] font-semibold"
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
