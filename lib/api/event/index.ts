import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';
import { ChannelDetailType, StreamErrorType } from '../channel';

export const fetchDataEventAPI = async (id: string) => {
  try {
    const res = await axiosInstance.get(`event/detail/${id}`);
    if (res) {
      return res.data;
    }
  } catch {
    return null;
  }
};

interface EventDetailResponseType {
  data?: ChannelDetailType;
  msg?: string;
}

const getEventDetail = async ({
  eventId,
}: {
  eventId: string;
}): Promise<AxiosResponse<EventDetailResponseType>> => {
  return axiosInstance.get(`event/detail/${eventId}`);
};

interface EventStreamResponseType {
  data?: StreamErrorType;
  msg?: string;
}

const getEventStreamData = async ({
  channel,
  autoProfile,
  streamType,
  data_type,
}: {
  channel?: ChannelDetailType;
  autoProfile?: string;
  streamType?: 'event' | 'premiere';
  data_type?: string;
}): Promise<AxiosResponse<EventStreamResponseType>> => {
  let url = '';
  if (streamType === 'event') {
    const isEventPremier =
      channel && channel.type && ['event'].includes(channel.type);
    if (data_type) {
      url = `stream/tv/${
        channel?.id
      }/${autoProfile}?data_type=${data_type}&enable_preview=${
        isEventPremier ? 0 : 1
      }`;
    } else {
      url = `stream/tv/${channel?.id}/${autoProfile}?enable_preview=${
        isEventPremier ? 0 : 1
      }`;
    }
  } else if (streamType === 'premiere') {
    url = `stream/vod/${channel?.id}/0/${autoProfile}`;
  }
  return axiosInstance.get(url);
};

export interface ReactionResponseType {
  status?: string;
  data?: boolean;
  msg?: string;
}

export interface SubscribeParamsType {
  id?: string | number;
  type?: string /* 'vod' | 'event' | 'channel' */;
  value?: 'sub' | 'unsub';
}

const subscribeEvent = async ({
  id,
  value,
  type,
}: SubscribeParamsType): Promise<AxiosResponse<ReactionResponseType>> => {
  if (value === 'sub') {
    return axiosInstance.post(
      `/notification/subscribe_room?type=${type}&id=${id}`,
      {
        type,
        id,
      },
    );
  }

  return axiosInstance.delete(
    `/notification/unsubscribe_room?type=${type}&id=${id}`,
    {
      data: {
        type,
        id,
      },
    },
  );
};

export { getEventDetail, getEventStreamData, subscribeEvent };
