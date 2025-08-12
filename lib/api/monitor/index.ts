import urlSecure from '@/lib/utils/urlSecure';
import { Secure } from '@/lib/utils/secure';
import { axiosInstance } from '../axios';
import { axiosInstancePingDrm } from '../axios/pingDrm';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { UAParser } from 'ua-parser-js';
import { StreamItemType as StreamItem } from '@/lib/api/stream';
import { ChannelDetailType } from '../channel';

const APi_MONITOR_WEB = new urlSecure(
  process.env.NEXT_PUBLIC_API_URL || '',
  `/api/${process.env.NEXT_PUBLIC_API_VERSION}/`,
  process.env.NEXT_PUBLIC_API_TOKEN || '',
);

const APi_MONITOR_BOX = new urlSecure(
  process.env.NEXT_PUBLIC_API_URL || '',
  `/api/${process.env.NEXT_PUBLIC_API_VERSION_MONITOR}_box_2019_w/`,
  'i6LuSoTM7kUQWjFaqtvsTb7AwLzQpv',
);

const APi_MONITOR_IOS = new urlSecure(
  process.env.NEXT_PUBLIC_API_URL || '',
  `/api/${process.env.NEXT_PUBLIC_API_VERSION_MONITOR}_ios_w/`,
  'ZtnQ6Crxuwkjsdg295NCgzRnuldasdjad',
);

const APi_MONITOR_SMARTTV_HTML = new urlSecure(
  process.env.NEXT_PUBLIC_API_URL || '',
  `/api/${process.env.NEXT_PUBLIC_API_VERSION_MONITOR}_ssam_ng_2014_w/`,
  'c5Ec6fYznG8qh8uXJPSvjghjWmnm8A',
);

const APi_MONITOR_SMARTTV_ANDROID = new urlSecure(
  process.env.NEXT_PUBLIC_API_URL || '',
  `/api/${process.env.NEXT_PUBLIC_API_VERSION_MONITOR}_tcl_w/`,
  'i6LuSoTM7kUQWjFaqtvsTb7AwLzQpv',
);

// Types
export type MonitorPlatform =
  | 'web'
  | 'box'
  | 'smarttv_html'
  | 'smarttv_android'
  | 'ios';

export interface MonitorEventItem {
  id: string;
  _id?: string;
  title?: string;
  description?: string;
  name?: string;
  is_event?: boolean;
}

export interface MonitorChannelResponse {
  Channels?: unknown[];
  data?: unknown[];
}

export interface MonitorEventResponse {
  status?: number;
  data?: MonitorEventItem[];
}

export interface MonitorStreamResponse {
  status?: number;
  msg?: string;
  enable_preview?: string;
  error_code?: number;
  data?: {
    url_dash_h265_hdr_10?: string;
    url_hls_h265?: string;
    ping_enable?: boolean;
    audio_img?: string;
    ping_multicast?: string;
    operator?: number;
    ping_mqtt?: string;
    url_dash_h265?: string;
    url_dash_h265_hlg?: string;
    url_hls_dolby_vision?: string;
    ping_enc?: boolean;
    url_hls_h265_hdr_10_plus?: string;
    url_hls_h265_hdr_10?: string;
    ping_qnet?: number;
    is_logged_in?: number;
    url_dash_h265_hdr_10_plus?: string;
    mqtt_mode?: string;
    overlay_logo?: string;
    require_active?: number;
    stream_session?: string;
    timeshift_url?: string;
    url_hls_h265_hlg?: string;
    ping_session?: string;
    url_dash_dolby_vision?: string;
    url?: string;
    tip_img?: string;
    url_dash_no_drm?: string;
    is_vip?: number;
    audio?: string;
  };
}

export interface BrowserInfo {
  name?: string;
  version?: string;
}

export interface ApiMonitorParams {
  device_monitor?: string;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ChannelData {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
}

export const apiMonitor = async (
  method: string,
  url: string,
  {
    device_monitor = 'web',
    query = {},
    params = {},
    headers = {},
    timeout = 0,
  }: ApiMonitorParams = {},
): Promise<AxiosResponse<MonitorChannelResponse | MonitorEventResponse>> => {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  const parser = new UAParser(navigator.userAgent);
  const browser = parser.getBrowser().name;
  const browserVersion = parser.getBrowser().version;
  const browserInfo = {
    name: browser,
    version: browserVersion,
  };

  // Do not mutate shared axiosInstance.baseURL repeatedly; it already includes
  // base url from axios/ index.ts. Only attach headers per request.

  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }

  if (method.toUpperCase() !== 'GET') {
    axiosInstance.defaults.headers.common['Content-Type'] =
      'application/json; charset=UTF-8';
  }

  // Ensure query is of correct type for createUrlV1
  const safeQuery: Record<string, string | number> =
    query && typeof query === 'object'
      ? Object.fromEntries(
          Object.entries(query).filter(
            ([, v]) => typeof v === 'string' || typeof v === 'number',
          ) as [string, string | number][],
        )
      : {};

  let fullUrl = APi_MONITOR_WEB.createUrlV1(
    url,
    safeQuery,
    browserInfo as { name: string; version: string },
    method,
  );

  switch (device_monitor) {
    case 'web':
      fullUrl = APi_MONITOR_WEB.createUrlV1(
        url,
        safeQuery,
        browserInfo as { name: string; version: string },
        method,
      );
      break;
    case 'box':
      fullUrl = APi_MONITOR_BOX.createUrlV1(
        url,
        safeQuery,
        browserInfo as { name: string; version: string },
        method,
      );
      break;
    case 'smarttv_html':
      fullUrl = APi_MONITOR_SMARTTV_HTML.createUrlV1(
        url,
        safeQuery,
        browserInfo as { name: string; version: string },
        method,
      );
      break;
    case 'smarttv_android':
      fullUrl = APi_MONITOR_SMARTTV_ANDROID.createUrlV1(
        url,
        safeQuery,
        browserInfo as { name: string; version: string },
        method,
      );
      break;
    case 'ios':
      fullUrl = APi_MONITOR_IOS.createUrlV1(
        url,
        safeQuery,
        browserInfo as { name: string; version: string },
        method,
      );
      break;
  }

  if (url.includes('user_stream_ping/ping/') && params?.ping_enc) {
    delete params.ping_enc;
    switch (method?.toUpperCase()) {
      case 'POST':
        params = {
          ...new Secure().encrypt(
            params as Record<string, unknown>,
            headers['X-Did'],
          ),
        };
        break;
      case 'DELETE':
        const urlSearchParams: URLSearchParams = new URLSearchParams(
          new URL(fullUrl)?.search,
        );
        params.st = urlSearchParams?.get('st');
        params.e = urlSearchParams?.get('e');
        break;
    }
  }

  const upper = method.toUpperCase();
  const reqConfig: AxiosRequestConfig = {
    url: fullUrl,
    method: upper,
    timeout,
    headers,
    withCredentials: false,
  };
  if (upper !== 'GET' && params) {
    reqConfig.data = JSON.stringify(params);
  }
  return axiosInstance(reqConfig);
};

// Monitor API functions
const isSilenceableNetworkError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError;
    return (
      ax.message === 'Network Error' ||
      ax.code === 'ERR_NETWORK' ||
      ax.code === 'ECONNABORTED'
    );
  }
  return false;
};
export const getMonitorChannels = async (
  deviceMonitor: MonitorPlatform = 'web',
) => {
  try {
    const response = await apiMonitor('GET', 'tv_monitor', {
      device_monitor: deviceMonitor,
      query: { data_type: 'test_event_before', device_monitor: deviceMonitor },
    });
    if (
      'Channels' in response.data &&
      Array.isArray((response.data as MonitorChannelResponse).Channels)
    ) {
      return (response.data as MonitorChannelResponse).Channels;
    }
    return [];
  } catch (error) {
    if (!isSilenceableNetworkError(error)) {
      console.error('Error fetching monitor channels:', error);
    }
    return [];
  }
};

export const getMonitorEvents = async (
  deviceMonitor: MonitorPlatform = 'web',
) => {
  try {
    const response = await apiMonitor('GET', '/monitor/event', {
      device_monitor: deviceMonitor,
      query: { data_type: 'test_event_before', device_monitor: deviceMonitor },
    });

    return response.data.data || [];
  } catch (error) {
    if (!isSilenceableNetworkError(error)) {
      console.error('Error fetching monitor events:', error);
    }
    return [];
  }
};

export const getMonitorChannelDetail = async (
  channelId: string,
  deviceMonitor: MonitorPlatform = 'web',
) => {
  try {
    const response = await apiMonitor('GET', `tv/detail/${channelId}`, {
      device_monitor: deviceMonitor,
      query: { fhd: 1, device_monitor: deviceMonitor },
    });
    // Only access .Channel if it exists on the response data
    if ('data' in response.data && response.data.data) {
      return response.data.data;
    }
    if ('Channel' in response.data) {
      return (response.data as { Channel: unknown }).Channel;
    }
    return null;
  } catch (error) {
    if (!isSilenceableNetworkError(error)) {
      console.error('Error fetching channel detail:', error);
    }
    return null;
  }
};

export const getMonitorChannelStream = async (
  channelDetail: ChannelDetailType,
  deviceMonitor: MonitorPlatform = 'web',
  opts?: { manifestId?: string },
): Promise<StreamItem | null> => {
  const manifestId = opts?.manifestId || channelDetail?.auto_profile;
  const endpoint = manifestId
    ? `stream/tv/${channelDetail._id || channelDetail.id}/${manifestId}`
    : `stream/tv/${channelDetail._id || channelDetail.id}`;

  try {
    const response = await apiMonitor('GET', endpoint, {
      device_monitor: deviceMonitor,
      query: { data_type: 'test_event_before', device_monitor: deviceMonitor },
    });
    const resData = response.data as MonitorStreamResponse;
    return (resData?.data as unknown as StreamItem) || null;
  } catch (error) {
    // Try to surface preview/alternate stream data for specific statuses
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = (error.response?.data ||
        {}) as Partial<MonitorStreamResponse> &
        Partial<{
          url?: string;
          trailer_url?: string;
          enable_preview?: string;
          data?: Record<string, unknown>;
        }>;

      if (status === 406 || status === 401 || status === 410) {
        // Shape a StreamItem-like object out of response payload so player can attempt preview
        const payload = (data?.data || {}) as Record<string, unknown>;
        const resolved: Record<string, unknown> = {
          ...(payload || {}),
        };
        // Prefer provided url, else trailer_url
        const fallbackUrl =
          String((payload as Record<string, unknown>)?.url || '') ||
          String(data?.url || '') ||
          String(data?.trailer_url || '');
        if (fallbackUrl) {
          (resolved as { url?: string }).url = fallbackUrl;
        }

        // Bubble enable_preview flag when present
        if (typeof data?.enable_preview !== 'undefined') {
          (resolved as { enable_preview?: string }).enable_preview = String(
            data.enable_preview,
          );
        }

        return resolved as unknown as StreamItem | null;
      }
    }
    if (!isSilenceableNetworkError(error)) {
      console.error('Error fetching channel stream:', error);
    }
    return null;
  }
};

// Ping functionality for monitor API
interface PingParamsType {
  session?: string;
  dataChannel?: ChannelDetailType;
  isNonDrm?: boolean;
  type?: string;
  event_id?: string;
}

export const pingChannel = async ({
  dataChannel,
  session,
  isNonDrm,
  type,
  event_id,
}: PingParamsType): Promise<AxiosResponse<number[]>> => {
  let url = `user_stream_ping/ping/${dataChannel?._id || dataChannel?.id}`;
  if (isNonDrm) {
    url = `user_stream_ping/ping/${
      dataChannel?._id || dataChannel?.id
    }?type=${type}&event_id=${event_id}`;
  }
  return axiosInstancePingDrm.post(url, {
    session,
  });
};

export const deletePingChannel = async ({
  dataChannel,
}: PingParamsType): Promise<AxiosResponse<number[]>> => {
  return axiosInstancePingDrm.delete(
    `user_stream_ping/ping/${dataChannel?._id || dataChannel?.id}`,
  );
};
