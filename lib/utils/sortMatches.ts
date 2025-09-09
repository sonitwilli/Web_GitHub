import { Match } from '@/lib/api/blocks';

/**
 * Check if a match object is a header (date divider)
 * @param match Match object to check
 * @returns true if it's a header object
 */
const isDateHeader = (match: Match): boolean => {
  return (
    (!match.away?.short_name)
  );
};

/**
 * Check if a match object is an actual match (has teams)
 * @param match Match object to check
 * @returns true if it's an actual match
 */
const isActualMatch = (match: Match): boolean => {
  return !!(match.home?.short_name && match.away?.short_name);
};

/**
 * Reorders matches by round_name while preserving the original date-based structure
 * Sorts matches within each date group by round_name, maintaining date headers in their positions
 * @param matches Array of Match objects to sort
 * @returns Sorted array of matches with date structure preserved
 */
export const reorderMatchesByRound = (matches: Match[]): Match[] => {
  const result: Match[] = [];
  let currentDateGroup: Match[] = [];
  let currentDateHeader: Match | null = null;

  for (const match of matches) {
    if (isDateHeader(match)) {
      // Process previous date group if exists
      if (currentDateHeader || currentDateGroup.length > 0) {
        if (currentDateHeader) {
          result.push(currentDateHeader);
        }
        
        // Sort matches in current date group by round_name
        if (currentDateGroup.length > 0) {
          const actualMatches = currentDateGroup.filter(isActualMatch);
          const otherItems = currentDateGroup.filter(m => !isActualMatch(m));
          
          // Group actual matches by round_name
          const matchesByRound = new Map<string, Match[]>();
          for (const match of actualMatches) {
            const roundName = match.round_name || 'Other';
            if (!matchesByRound.has(roundName)) {
              matchesByRound.set(roundName, []);
            }
            matchesByRound.get(roundName)!.push(match);
          }
          
          // Sort round names and add matches
          const sortedRoundNames = Array.from(matchesByRound.keys()).sort((a, b) => 
            a.localeCompare(b)
          );
          
          for (const roundName of sortedRoundNames) {
            const roundMatches = matchesByRound.get(roundName)!;
            // Sort matches within the same round by time
            roundMatches.sort((a, b) => {
              if (a.begin_time && b.begin_time) {
                return a.begin_time.localeCompare(b.begin_time);
              }
              return 0;
            });
            result.push(...roundMatches);
          }
          
          // Add any other non-match items
          result.push(...otherItems);
        }
      }
      
      // Start new date group
      currentDateHeader = match;
      currentDateGroup = [];
    } else {
      // Add to current date group
      currentDateGroup.push(match);
    }
  }

  // Process the last group
  if (currentDateHeader || currentDateGroup.length > 0) {
    if (currentDateHeader) {
      result.push(currentDateHeader);
    }
    
    if (currentDateGroup.length > 0) {
      const actualMatches = currentDateGroup.filter(isActualMatch);
      const otherItems = currentDateGroup.filter(m => !isActualMatch(m));
      
      // Group actual matches by round_name
      const matchesByRound = new Map<string, Match[]>();
      for (const match of actualMatches) {
        const roundName = match.round_name || 'Other';
        if (!matchesByRound.has(roundName)) {
          matchesByRound.set(roundName, []);
        }
        matchesByRound.get(roundName)!.push(match);
      }
      
      // Sort round names and add matches
      const sortedRoundNames = Array.from(matchesByRound.keys()).sort((a, b) => 
        a.localeCompare(b)
      );
      
      for (const roundName of sortedRoundNames) {
        const roundMatches = matchesByRound.get(roundName)!;
        roundMatches.sort((a, b) => {
          if (a.begin_time && b.begin_time) {
            return a.begin_time.localeCompare(b.begin_time);
          }
          return 0;
        });
        result.push(...roundMatches);
      }
      
      result.push(...otherItems);
    }
  }

  // If no processing occurred, return original array
  if (result.length === 0) {
    return matches;
  }

  return result;
};