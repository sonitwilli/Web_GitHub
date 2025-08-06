import Link from 'next/link';
import { GoChevronRight } from 'react-icons/go';
import { FC } from 'react';

interface ShowMoreProps {
  variant?: 'button' | 'link';
  href?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const ShowMore: FC<ShowMoreProps> = ({
  variant = 'button',
  href = '#',
  className,
  children,
  onClick,
}) => {
  const baseStyles = `relative cursor-pointer border border-[1px] border-white-024 h-8 w-8 rounded-full bg-white-012 flex items-center justify-center group transition-all duration-300 hover:w-[120px] overflow-hidden ${className}`;

  const content = (
    <div className="flex items-center justify-center gap-2 w-full overflow-hidden">
      <span className="absolute left-[12px] text-white text-[16px] font-[400] hidden group-hover:block whitespace-nowrap">
        {children || 'Xem thêm'}
      </span>
      <GoChevronRight className="absolute right-[3px] text-white" size={24} />
    </div>
  );

  if (variant === 'link') {
    return (
      <Link href={href} className={baseStyles} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseStyles} onClick={onClick}>
      {content}
    </button>
  );
};

export default ShowMore;
