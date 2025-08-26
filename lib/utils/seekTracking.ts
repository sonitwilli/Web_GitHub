import { saveSessionStorage } from './storage';
import { trackingStoreKey } from '../constant/tracking';

export interface SeekEventData {
  timestamp: number;
  direction: 'forward' | 'backward' | 'seekbar';
  method: 'button' | 'keyboard' | 'seekbar';
}

export const saveSeekEvent = (seekData: SeekEventData) => {
  try {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.SEEK_VIDEO_EVENT,
          value: JSON.stringify(seekData),
        },
      ],
    });
  } catch (error) {
    console.error('Error saving seek event:', error);
  }
};

export const getSeekEvent = (): SeekEventData | null => {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const seekEvent = sessionStorage.getItem(trackingStoreKey.SEEK_VIDEO_EVENT);
    return seekEvent ? JSON.parse(seekEvent) : null;
  } catch (error) {
    console.error('Error getting seek event:', error);
    return null;
  }
};

export const clearSeekEvent = () => {
  try {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    sessionStorage.removeItem(trackingStoreKey.SEEK_VIDEO_EVENT);
  } catch (error) {
    console.error('Error clearing seek event:', error);
  }
};
