import {
  DEFAULT_API_SUFFIX,
  DEVICE_ID,
  TOKEN,
  NUMBER_PR,
  TYPE_PR,
  REVISION,
} from '@/lib/constant/texts';
import { base64, md5 } from '@/lib/utils/hash';
import axios, { AxiosError } from 'axios';
import { getCookie } from 'cookies-next';
import { browserRealVersion } from '@/lib/utils/getBrowser';
import moment from 'moment';
import { stopMqttManual } from '@/lib/hooks/useMqtt';
import { showToast } from '@/lib/utils/globalToast';
import React from 'react';
import NoInternetIcon from '@/lib/components/icons/NoInternetIcon';

export interface BrowserInfo {
  name?: string;
  version?: string;
}

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`,
  timeout: 10000,
});

const skipToastUrls = ['web-ott', 'layout/footer', 'playos/block', 'master.m3u8', 'channel'];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for network error and show popup
    if (error.message && error.message.toUpperCase().includes('NETWORK')) {
      // Skip showing toast for web-ott URLs
      const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';
      
      if (!skipToastUrls.some((url) => currentUrl.includes(url))) {
        showToast({
          title: 'Mất kết nối mạng',
          customIcon: React.createElement(NoInternetIcon),
          timeout: 3000,
        });
      }
    }
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.request.use(
  async ($config) => {
    const urls = `${$config.baseURL?.toString()}${$config.url?.toString()}`;
    const parsed = new URL(urls);
    const params = new URLSearchParams(parsed.search);
    const timeOutParam = params.get('time_out');
    const parsedTimeout = Number(timeOutParam);
    if (!isNaN(parsedTimeout)) {
      $config.timeout = parsedTimeout;
    }
    let deviceId = getCookie(DEVICE_ID) || '';
    let profileType = getCookie(TYPE_PR) || '';
    let profileId = getCookie(NUMBER_PR) || '';
    const userAgentInfo: BrowserInfo = { name: '', version: '' };

    if (!$config?.params) {
      $config.params = {};
    }
    if (typeof window !== 'undefined') {
      const tempPfType = localStorage.getItem(TYPE_PR) || '';
      const tempPrId = localStorage.getItem(NUMBER_PR) || '';
      deviceId = localStorage.getItem(DEVICE_ID) || '';
      profileType = tempPfType ? tempPfType : '';
      profileId = tempPrId ? tempPrId : '';

      // token
      const token = localStorage.getItem(TOKEN);
      if (token) {
        $config.headers.Authorization = `Bearer ${token}`;
      }
      // revision
      const revision = localStorage.getItem(REVISION);
      if (revision) {
        $config.headers.revision = revision;
      }

      const browserInfo = localStorage.getItem('browser_info');
      if (browserInfo) {
        const parsedBrowserInfo: BrowserInfo = JSON.parse(browserInfo);
        userAgentInfo.name = parsedBrowserInfo.name || '';
        userAgentInfo.version = parsedBrowserInfo.version || '';
      } else {
        const deviceInfo = await browserRealVersion();
        userAgentInfo.name = deviceInfo?.name || '';
        userAgentInfo.version = deviceInfo?.version || '';
        localStorage.setItem('browser_info', JSON.stringify(userAgentInfo));
      }
    }
    const currentDate = moment().format('DD-MM-YYYY');
    // device_id
    if (
      $config?.url?.includes('message_broker/mqtt') &&
      typeof sessionStorage !== 'undefined'
    ) {
      const tab = sessionStorage.getItem('tabId') || '';
      $config.headers['X-Did'] = tab || deviceId;
    } else {
      $config.headers['X-Did'] = deviceId;
    }

    // profile
    if (profileId && profileType) {
      $config.headers.Profileid = profileId;
      $config.headers.Profiletype = profileType;
    }
    // encode user
    let uriSend = '';
    const suffix = DEFAULT_API_SUFFIX;
    const fullUrl = $config.url || '';
    uriSend = fullUrl || '';
    if (uriSend[0] === '/') uriSend = uriSend.slice(1);
    if (uriSend.includes('?')) {
      const uriSendSplit = uriSend.split('?');
      uriSend = uriSendSplit[0];
    }

    const expireTime = Math.floor(new Date().getTime() / 1000) + 3600;
    const neKeyUser =
      `${process.env.NEXT_PUBLIC_API_TOKEN}` + expireTime + suffix + uriSend;

    const st = base64(md5(neKeyUser))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    $config.params.st = st;
    $config.params.e = expireTime;

    // parse user agent
    $config.params.device =
      userAgentInfo.name +
      encodeURIComponent(`(version:${userAgentInfo.version})`);
    $config.params.drm = 1;
    if ($config?.url && $config.url.includes('user/otp')) {
      $config.params.since = currentDate;
    }
    return $config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const er = (error || {}) as AxiosError;
    if (er?.status === 401) {
      stopMqttManual();
    }
    return Promise.reject(error);
  },
);

export { axiosInstance };
