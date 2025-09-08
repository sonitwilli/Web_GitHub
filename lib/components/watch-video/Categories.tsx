import Link from 'next/link';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { createLink } from '@/lib/utils/methods';

export default function Categories() {
  const { dataChannel } = usePlayerPageContext();

  if (!dataChannel?.category?.length) {
    return;
  }

  return (
    <div className="flex items-center gap-[8px]">
      {dataChannel?.category?.map((c, index) => (
        <Link
          key={index}
          href={createLink({ data: c, type: c.type as string }) || '#'}
          className={`block px-[8px] py-[4px] rounded-[8px] text-[14px] bg-eerie-black hover:bg-charleston-green`}
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}
