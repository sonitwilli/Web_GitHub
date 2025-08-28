// components/League.tsx
import Link from 'next/link';
import { useMemo } from 'react';
import { convertTimeStandardVN } from '@/lib/utils/sport';
import { Match } from '@/lib/api/blocks';
import { MATCH_DATE } from '@/lib/constant/texts';

interface Props {
  typeLeague?: string;
  className?: string;
  data?: Match | null;
  preRoundName?: string;
  preMatchDate?: string;
  lastIndex?: boolean;
  noMarginBottom?: boolean;
  leagueLogo?: string;
  metaDataName?: string;
}

const League: React.FC<Props> = ({
  data,
  preRoundName = '',
  preMatchDate = '',
  lastIndex = false,
  noMarginBottom = false,
  leagueLogo,
  metaDataName,
}) => {
  const isLive = useMemo(() => {
    if (!data) return false;
    const now = new Date();
    return (
      new Date(data?.begin_time as string) < now &&
      new Date(data?.end_time as string) > now
    );
  }, [data]);

  const convertTime = convertTimeStandardVN();

  if (!data || data?.id === 'loadmore') return null;

  const showDate =
    data?.match_type === MATCH_DATE && data?.match_date !== preMatchDate;
  const showRound =
    data?.match_type === 'round_id' &&
    data?.round_name &&
    data?.round_name !== preRoundName;

  return (
    <div className={lastIndex ? 'rounded-b-lg' : ''}>
      {showDate && (
        <div className="text-center text-sm font-semibold text-white my-3">
          {convertTime(data?.match_date as string, 'DD')} -{' '}
          {convertTime(data?.match_date as string, 'dd/MM/yyyy')}
        </div>
      )}
      {showRound && (
        <div className="text-center text-sm font-semibold text-white my-3 ">
          {data?.round_name}
        </div>
      )}

      {data?.home?.short_name ? (
        <div
          id="league"
          className={`bg-raisin-black flex items-center justify-center px-4 py-3 text-white ${
            noMarginBottom ? 'mb-0' : 'mb-2'
          }`}
        >
          <div className="w-full flex items-center justify-center">
            <div className="text-sm font-semibold min-w-[55px]">
              {data?.home.short_name}
            </div>
            <div className="flex items-center justify-around w-1/2 gap-5">
              {data?.home.logo && (
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src={data?.home.logo}
                    alt=""
                    className="h-[25px] w-[25px]"
                  />
                </div>
              )}
              <div className="text-center flex items-center">
                {data?.home.score &&
                !isLive &&
                parseInt(data?.is_finished as string) ? (
                  <span className="bg-white text-dark-purple text-base font-bold px-2 py-1 rounded w-[70px] h-[24px] leading-[1.1]">
                    {data?.home.score} - {data?.away?.score}
                  </span>
                ) : isLive ? (
                  <span className="w-[35px] h-[20px]">
                    <img
                      src="/images/the-thao/live.png"
                      alt="live"
                      className="h-[20px] w-[35px]"
                    />
                  </span>
                ) : (
                  <span className="bg-white/10 text-white px-2 py-1 rounded">
                    {convertTime(data?.begin_time as string, 'hh:mm')}
                  </span>
                )}
              </div>
              {data?.away?.logo && (
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src={data?.away.logo}
                    alt=""
                    className="h-[25px] w-[25px]"
                  />
                </div>
              )}
            </div>
            <div className="text-sm font-semibold min-w-[55px]">
              {data?.away?.short_name}
            </div>
            {data?.highlight_id &&
              data?.type &&
              !parseInt(data?.is_finished as string) && (
                <div className="w-[14%] pl-4 absolute right-[35px]">
                  <Link
                    href={`/su-kien/${data?.highlight_id}?event=${data?.type}`}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="1em"
                      height="1em"
                      focusable="false"
                      role="img"
                      aria-label="play fill"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                    >
                      <g transform="translate(8 8) scale(1.5 1.5) translate(-8 -8)">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
                      </g>
                    </svg>
                  </Link>
                </div>
              )}
          </div>
        </div>
      ) : (
        <div
          id="title"
          className="bg-charleston-green rounded-t-lg p-4 flex justify-between items-center h-[56px]"
        >
          <div className="text-white font-medium text-sm">
            {data?.id === MATCH_DATE || !data?.round_name
              ? `${convertTime(
                  data?.match_date as string,
                  'DD',
                )} - ${convertTime(data?.match_date as string, 'dd/MM/yyyy')}`
              : data?.round_id}
          </div>
          {leagueLogo && leagueLogo !== 'None' && (
            <img
              src={leagueLogo}
              alt={metaDataName || ''}
              className="w-[40px] h-[40px]"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default League;