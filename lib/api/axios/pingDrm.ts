import {
  DEFAULT_API_SUFFIX,
  TOKEN,
  NUMBER_PR,
  TYPE_PR,
} from '@/lib/constant/texts';
import { stopMqttManual } from '@/lib/hooks/useMqtt';
import { base64, md5 } from '@/lib/utils/hash';
import { browserInfo, getUserAgent, UserAgentType } from '@/lib/utils/methods';
import { Secure } from '@/lib/utils/secure';
import axios, { AxiosError } from 'axios';
import { getCookie } from 'cookies-next';

export interface BrowserInfo {
  name?: string;
  version?: string;
}

const axiosInstancePingDrm = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`,
  timeout: 10000,
});

axiosInstancePingDrm.interceptors.request.use(
  async ($config) => {
    const urls = `${$config.baseURL?.toString()}${$config.url?.toString()}`;
    const parsed = new URL(urls);
    const params = new URLSearchParams(parsed.search);
    const timeOutParam = params.get('time_out');
    const parsedTimeout = Number(timeOutParam);
    if (!isNaN(parsedTimeout)) {
      $config.timeout = parsedTimeout;
    }
    let profileType = getCookie(TYPE_PR) || '';
    let profileId = getCookie(NUMBER_PR) || '';
    const userAgentInfo: BrowserInfo = { name: '', version: '' };
    let device: UserAgentType = {};

    if (!$config?.params) {
      $config.params = {};
    }
    if (typeof window !== 'undefined') {
      profileType = localStorage.getItem(TYPE_PR) || '';
      profileId = localStorage.getItem(NUMBER_PR) || '';
      device = getUserAgent();

      // token
      const token = localStorage.getItem(TOKEN);
      if (token) {
        $config.headers.Authorization = `Bearer ${token}`;
      }
    }
    const deviceID = browserInfo();
    $config.headers['X-Did'] = deviceID;
    // profile
    if (profileId && profileType) {
      $config.headers.Profileid = profileId;
      $config.headers.Profiletype = profileType;
    }
    // encode user
    let uriSend = '';
    const suffix = DEFAULT_API_SUFFIX;
    const fullUrl = $config.url || '';
    const arr = fullUrl.split(DEFAULT_API_SUFFIX);
    uriSend = arr[0] || '';
    uriSend = uriSend.includes('?')
      ? uriSend.substr(0, uriSend.indexOf('?'))
      : uriSend;

    const expireTime = Math.floor(new Date().getTime() / 1000) + 3600;
    const neKeyUser =
      `${process.env.NEXT_PUBLIC_API_TOKEN}` + expireTime + suffix + uriSend;

    const st = base64(md5(neKeyUser))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    $config.params.st = st;
    $config.params.e = expireTime;

    if ($config?.method?.toUpperCase() === 'POST') {
      delete $config.data.ping_enc;
      const secureData = Array.from(
        new Secure().encrypt($config?.data, deviceID),
      );
      $config.data = secureData ? JSON.stringify(secureData) : secureData;
    }

    // parse user agent
    userAgentInfo.name = device.browser?.name || '';
    userAgentInfo.version = device.browser?.version || '';
    $config.params.device =
      userAgentInfo.name +
      encodeURIComponent(`(version:${userAgentInfo.version})`);

    return $config;
  },
  (error) => Promise.reject(error),
);

axiosInstancePingDrm.interceptors.response.use(
  (response) => response,
  // (error) => Promise.reject(error),
  (error) => {
    const er = (error || {}) as AxiosError;
    if (er?.status === 401) {
      stopMqttManual();
    }
    return Promise.reject(error);
  },
);

export { axiosInstancePingDrm };
