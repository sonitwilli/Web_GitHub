import { BlockSlideItemType } from '@/lib/api/blocks';

let cachedTimestamp = 0;
let lastCacheTime = 0;

const getCurrentTimestamp = (): number => {
  const now = Date.now();
  
  if (now - lastCacheTime > 1000) {
    cachedTimestamp = Math.floor(now / 1000);
    lastCacheTime = now;
  }
  return cachedTimestamp;
};

export const isEventEnded = (item: BlockSlideItemType): boolean => {
  // Early return for non events
  if (!item?.type || !['event', 'eventtv'].includes(item.type)) {
    return false; 
  }

  // Early return if no end_time
  if (!item.end_time) {
    return false;
  }

  const currentTimestamp = getCurrentTimestamp();
  const endTime = parseInt(item.end_time, 10);

  // Invalid end_time
  if (!endTime || isNaN(endTime)) {
    return false;
  }

  // Simple check: current time > end time = ended
  return currentTimestamp > endTime;
};


export const filterEndedEvents = (data: BlockSlideItemType[]): BlockSlideItemType[] => {
  if (!Array.isArray(data) || data.length === 0) return data;
  
  // Quick check: does this block contain any events?
  let hasEvents = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i]?.type === 'event' || data[i]?.type === 'eventtv') {
      hasEvents = true;
      break;
    }
  }
  
  if (!hasEvents) {
    return data; // No events, return original data
  }

  // Filter out ended events
  return data.filter(item => !isEventEnded(item));
};



export const getEventStatus = (item: BlockSlideItemType): 'scheduled' | 'live' | 'ended' | null => {
  if (!item?.type || !['event', 'eventtv'].includes(item.type)) {
    return null;
  }

  const currentTimestamp = getCurrentTimestamp();
  const startTime = parseInt(item.start_time || item.begin_time || '0', 10);
  const endTime = parseInt(item.end_time || '0', 10);

  if (!startTime || !endTime || isNaN(startTime) || isNaN(endTime)) {
    return null;
  }

  if (currentTimestamp < startTime) {
    return 'scheduled';
  } else if (currentTimestamp <= endTime) {
    return 'live';
  } else {
    return 'ended';
  }
};
