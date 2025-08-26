import { MenuItem } from '@/lib/api/menu';
// import useClickOutside from '@/lib/hooks/useClickOutside';
import useMenu from '@/lib/hooks/useMenu';
import Link from 'next/link';
import { useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';

interface Props {
  menus?: MenuItem[];
}
export default function MenuMore({ menus }: Props) {
  const [open, setOpen] = useState(false);
  // const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const { saveMenuMore, clickLinkItem } = useMenu();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-primary-gray hover:text-fpl font-[600] hover:cursor-pointer flex items-center gap-[4px] 2xl:text-[18px]"
      >
        Xem thêm
        <FaCaretDown />
      </button>

      {open ? (
        <div
          // ref={ref}
          className="min-w-[240px] absolute top-[130%] left-1/2 -translate-x-1/2 grid grid-cols-2 p-[8px] bg-eerie-black z-[2] rounded-[16px]"
        >
          {menus &&
            menus?.length > 0 &&
            menus.map((menu, index) => (
              <Link
                key={index}
                href={`/trang/${menu.id}`}
                className="p-[8px] text-spanish-gray hover:text-fpl font-[600] text-[16px] leading-[130%] tracking-[0.32px] flex items-center justify-center text-center"
                onClick={(ev) => {
                  clickLinkItem({
                    event: ev,
                    menuItem: menu,
                    cb: () => {
                      setOpen(false);
                      saveMenuMore({ menuItem: menu });
                    },
                  });
                }}
                title={menu?.name}
                prefetch={false}
              >
                {menu?.logo && menu?.is_display_logo === '1' ? (
                  <img
                    src={menu.logo}
                    alt={menu.name}
                    className="max-h-[14px]"
                  />
                ) : (
                  <span
                    className="block text-center max-w-[96px] overflow-hidden break-words"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {menu?.name}
                  </span>
                )}
              </Link>
            ))}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
