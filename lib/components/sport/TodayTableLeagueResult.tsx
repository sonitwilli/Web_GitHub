import { FC, useMemo } from 'react';
import {
  BlockSlideItemType,
  Match,
  BlockItemResponseType,
} from '@/lib/api/blocks';
import LeagueDetail from '@/lib/components/sport/League';
import { League } from '@/lib/api/blocks';

interface TodayTableLeagueResultProps {
  blockData?: BlockItemResponseType;
  height?: string;
  pageType?: string | number;
}

// Utility function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Utility function to filter today's matches from all data and group by league
const getTodayMatchesByLeague = (blockData: BlockItemResponseType): Record<string, { matches: Match[], league: League }> => {
  if (!blockData?.data || !Array.isArray(blockData.data)) {
    return {};
  }

  const today = getTodayDate();
  const matchesByLeague: Record<string, { matches: Match[], league: League }> = {};

  blockData.data.forEach((item: BlockSlideItemType) => {
    if (item?.league?.matches && Array.isArray(item.league.matches)) {
      const leagueName = item.league.name || 'Unknown League';
      
      const todayMatches: Match[] = [];
      item.league.matches.forEach((match: Match) => {
        if (match.match_date === today) {
          // Add league info to the match for display
          const matchWithLeague = {
            ...match,
            league: {
              ...item.league!,
              name: item.league!.name || 'Unknown League',
              image: item.league!.image || '',
            },
          };
          todayMatches.push(matchWithLeague);
        }
      });

      if (todayMatches.length > 0) {
        matchesByLeague[leagueName] = {
          matches: todayMatches,
          league: item.league
        };
      }
    }
  });

  return matchesByLeague;
};

const TodayTableLeagueResult: FC<TodayTableLeagueResultProps> = ({
  blockData,
  height = '',
  pageType = '',
}) => {
  // const today = getTodayDate(); // Unused variable removed
  
  // Get today's matches grouped by league
  const matchesByLeague = useMemo(() => getTodayMatchesByLeague(blockData || {}), [blockData]);

  // Don't render anything if there are no matches today
  if (Object.keys(matchesByLeague).length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {Object.entries(matchesByLeague).map(([leagueName, leagueData]) => (
        <div
          key={leagueName}
          className={`flex flex-col justify-between ${
            pageType === 'sport'
              ? 'h-[500px] bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black rounded-lg'
              : ''
          }`}
          style={{ minHeight: height !== '0px' ? height : 'auto' }}
        >
          <div className="flex flex-col flex-1">
            {/* Header with league name and logo - same as SportItem */}
            <div className="bg-charleston-green rounded-t-lg p-4 flex justify-between items-center h-[56px]">
              <div className="font-medium text-sm text-white">
                {leagueName}
              </div>
              {leagueData.league?.image && leagueData.league.image !== 'None' && (
                <img
                  src={leagueData.league.image}
                  alt={leagueName || 'League Logo'}
                  className="w-[40px] h-[40px]"
                />
              )}
            </div>

            {/* Matches content - same structure as SportItem */}
            <div className="flex-1 bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black rounded-lg">
              <div>
                {leagueData.matches.map((match, index) => (
                  <div key={`${leagueName}-match-${index}`}>
                    <LeagueDetail
                      typeLeague="today_matches"
                      data={match}
                      leagueLogo={leagueData.league?.image || ''}
                      noMarginBottom={index === leagueData.matches.length - 1}
                      lastIndex={index === leagueData.matches.length - 1}
                      className="bg-gradient-to-b from-black-035 to-black-035 bg-raisin-black"
                      preRoundName={
                        index > 0 ? leagueData.matches[index - 1].round_name : ''
                      }
                      preMatchDate={
                        index > 0 ? leagueData.matches[index - 1].match_date : ''
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodayTableLeagueResult;