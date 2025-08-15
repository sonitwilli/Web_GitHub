import { FC } from 'react';
import { RankingItem, NameLeague, MetaData } from '@/lib/api/blocks/index';

interface TableResultProps {
  data: RankingItem | null;
  idRow: number | null;
  imgLogo: string | null;
  nameLeague: NameLeague | null;
  lastIndex: boolean;
  getMetaData?: MetaData | null;
}

// Component chính
const TableResult: FC<TableResultProps> = ({
  data,
  idRow,
  imgLogo,
  nameLeague,
  lastIndex,
  getMetaData,
}) => {
  if (!data) return null;

  return (
    <div className="w-full box-border">
      {data.id === 'round_name' ? (
        <div className="bg-charleston-green rounded-t-lg p-4 flex justify-between items-center h-[56px]">
          {data.round_name && (
            <div className="text-white font-medium text-sm">
              {data.round_name}
            </div>
          )}
          {imgLogo && imgLogo !== 'None' && (
            <img
              src={imgLogo}
              alt={getMetaData?.name || 'Logo'}
              className="object-contain w-[40px] h-[40px]"
            />
          )}
        </div>
      ) : (
        <div
          className={`flex items-center w-full p-3 h-[43px] ${
            idRow && idRow % 2 !== 0
              ? 'bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black'
              : 'bg-raisin-black'
          }`}
        >
          <div className="flex w-full">
            <div className="w-[16%] text-center text-white">
              {data.position}
            </div>
            <div className="w-[26%] flex items-center text-white">
              {idRow !== 0 && data.logo && (
                <img
                  src={data.logo}
                  alt={data.team || 'Team Logo'}
                  className="pr-1 w-[25px] h-[25px]"
                />
              )}
              <span>{data.team}</span>
            </div>
            <div
              className={`${
                nameLeague?.is_stage !== '' ? 'w-[10%]' : 'w-[20%]'
              } text-center text-white`}
            >
              {data.played}
            </div>
            {nameLeague?.is_stage !== '' && (
              <>
                <div className="w-[10%] text-center text-white">{data.won}</div>
                <div className="w-[10%] text-center text-white">
                  {data.draw}
                </div>
                <div className="w-[10%] text-center text-white">
                  {data.lost}
                </div>
              </>
            )}
            <div
              className={`${
                nameLeague?.is_stage !== '' ? 'w-[10%]' : 'w-[20%]'
              } text-center text-white`}
            >
              {data.goal_difference}
            </div>
            <div
              className={`${
                nameLeague?.is_stage !== '' ? 'w-[10%]' : 'w-[20%]'
              } text-center text-white`}
            >
              {data.point}
            </div>
          </div>
        </div>
      )}
      {lastIndex && <hr className="border-oxford-blue my-0.5" />}
    </div>
  );
};

export default TableResult;