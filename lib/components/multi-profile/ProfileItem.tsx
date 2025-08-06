import { useEffect } from "react";
import moment from "moment";
import { IoIosArrowDown } from "react-icons/io";

// Define the interface for the profile item
interface ProfileItem {
  id?: string;
  date?: string;
  title?: string;
}

// Define the props interface
interface ProfileItemProps {
  data: ProfileItem[];
  isMore?: boolean;
  onShowMore?: () => void;
  setSidebar?: (sidebar: { text: string; url: string }) => void; // Replace Vuex mutation with a callback prop
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  data,
  isMore = true,
  onShowMore,
  setSidebar,
}) => {
  // Equivalent to Vue's mounted lifecycle hook
  useEffect(() => {
    if (setSidebar) {
      setSidebar({
        text: "Quản lý hồ sơ và tùy chọn",
        url: "/tai-khoan/quan-ly-va-tuy-chon",
      });
    }
  }, [setSidebar]);

  // Format date function
  const formatTime = (date?: string): string => {
    return date ? moment(date).format("DD/MM/YY") : "";
  };

  return (
    <div className="w-full">
      {data && data.length > 0 && (
        <>
          {data.map((item, idx) => (
            <div
              key={item?.id}
              className={`flex items-center gap-10 justify-start py-4 border-b border-white/10
                ${idx === 0 ? "pt-0" : ""}
                ${idx === data.length - 1 && !isMore ? "pb-0 border-b-0" : ""}`}
            >
              <span className="text-base font-normal leading-6 text-spanish-gray">
                {formatTime(item?.date)}
              </span>
              <h3 className="text-base font-normal leading-6 text-white-smoke whitespace-nowrap overflow-hidden text-ellipsis mb-0">
                {item?.title}
              </h3>
            </div>
          ))}
          {isMore && (
            <div className="pt-4">
              <button
                onClick={onShowMore}
                className="cursor-pointer inline-flex items-center gap-[6px] bg-transparent border-0 outline-0 text-base font-medium leading-6 text-spanish-gray"
              >
                Xem thêm
                <IoIosArrowDown size={24} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileItem;