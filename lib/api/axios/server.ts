import axios from 'axios';
import { UserAgentType } from '@/lib/utils/methods';
import { DEFAULT_API_SUFFIX, NUMBER_PR, TYPE_PR } from '@/lib/constant/texts';
import { base64, md5 } from '@/lib/utils/hash';
import moment from 'moment';

export interface BrowserInfo {
  name?: string;
  version?: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const axiosServer = ({ cookies }: { cookies: any }) => {
  const serverInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`,
    timeout: 10000,
  });

  serverInstance.interceptors.request.use(
    async ($config) => {
      const urls = `${$config.baseURL?.toString()}${$config.url?.toString()}`;
      const parsed = new URL(urls);
      const params = new URLSearchParams(parsed.search);
      const timeOutParam = params.get('time_out');
      const parsedTimeout = Number(timeOutParam);
      if (!isNaN(parsedTimeout)) {
        $config.timeout = parsedTimeout;
      }
      let deviceId;
      let profileType;
      let profileId;
      const userAgentInfo: BrowserInfo = { name: '', version: '' };
      const device: UserAgentType = {};
      if (!$config?.params) {
        $config.params = {};
      }
      if (cookies) {
        profileId = cookies[NUMBER_PR];
        profileType = cookies[TYPE_PR];
      }
      const currentDate = moment().format('DD-MM-YYYY');
      // device_id
      $config.headers['X-Did'] = deviceId;
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
      uriSend = arr[1] || '';

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
      userAgentInfo.name = device.browser?.name || '';
      userAgentInfo.version = device.browser?.version || '';
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

  serverInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  );

  return serverInstance;
};

export { axiosServer };
