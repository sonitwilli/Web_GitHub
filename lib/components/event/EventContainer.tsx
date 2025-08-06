import { useCallback, useEffect, useState } from 'react';
import { fetchDataEventAPI } from '@/lib/api/event';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { watchEventDocument } from '@/lib/plugins/firebase';
import EventView from './EventView';
import { useDispatch } from 'react-redux';
import { setDataEvent } from '@/lib/store/slices/playerSlice';

type Props = {
  eventId?: string;
  type?: 'event' | 'premier';
};

export type EventDetailExtended = BlockSlideItemType & {
  blocks?: BlockItemType[];
  begin_time?: number;
};

export interface FirebaseEventData {
  title?: string;
  autoplay?: string;
  video_id?: string;
  start_time?: string;
  end_time?: string;
  is_premier?: number;
  publish?: string;
  random?: string;
  relateds?: unknown[];
  timeshow_related?: string;
  hi_id?: string;
}

const firebasePreferredFields: (keyof FirebaseEventData)[] = [
  'title',
  'autoplay',
  'video_id',
  'start_time',
  'end_time',
  'is_premier',
  'publish',
  'random',
  'relateds',
  'timeshow_related',
  'hi_id',
];

const EventContainer = ({ eventId, type }: Props) => {
  const [dataEvent, setDataEventLocal] = useState<EventDetailExtended>();
  const dispatch = useDispatch();

  const mergeEventData = useCallback(
    (firebaseData: FirebaseEventData, apiData: EventDetailExtended) => {
      const merged: Record<string, unknown> = { ...apiData };

      firebasePreferredFields.forEach((key) => {
        const value = firebaseData[key];
        if (value !== undefined) {
          merged[key] = value;
        }
      });

      const finalData = merged as EventDetailExtended;
      setDataEventLocal(finalData);
      dispatch(setDataEvent(finalData));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!eventId) return;

    let unsubscribe: (() => void) | undefined;

    const fetchData = async () => {
      try {
        const res = await fetchDataEventAPI(eventId);
        const apiData = res?.data;

        if (apiData) {
          setDataEventLocal(apiData);
          dispatch(setDataEvent(apiData)); // 🔁 Update Redux store

          const isPremier =
            apiData.is_premier === '1' || apiData.is_premier === '0';
          const isEventType = apiData.type === 'event';

          if (isPremier && isEventType) {
            unsubscribe = watchEventDocument(
              eventId,
              (firebaseData) => {
                if (firebaseData) {
                  mergeEventData(firebaseData, apiData);
                }
              },
              () => {},
            );
          }
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
      }
    };

    fetchData();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [dispatch, eventId, mergeEventData]);

  return <EventView dataEvent={dataEvent} eventId={eventId} type={type} />;
};
export default EventContainer;
