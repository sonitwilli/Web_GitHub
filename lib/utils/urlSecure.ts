import moment from 'moment';
import { md5, base64 } from '@/lib/utils/hash';

interface BrowserInfo {
  name: string;
  version: string;
}

interface QueryParams {
  [key: string]: string | number;
}

export const JsToUrlParams = (
  isAddQuestionMark: boolean,
  jsData: Record<string, string | number>,
): string => {
  const questionMark = isAddQuestionMark ? '?' : '&';
  return (
    questionMark +
    Object.keys(jsData)
      .map(function (k) {
        return (
          encodeURIComponent(k) + '=' + encodeURIComponent(String(jsData[k]))
        );
      })
      .join('&')
  );
};

export default class urlSecure {
  private readonly api_token: string;
  private readonly suffix: string;
  private readonly api_url: string;

  constructor(domain: string, suffix: string, apiToken: string) {
    this.api_token = apiToken;
    this.suffix = suffix;
    this.api_url = domain + suffix;
  }

  createUrlV1(
    uri: string,
    query: QueryParams | null,
    browserInfo: BrowserInfo,
    method: string,
  ): string {
    if (uri[0] === '/') uri = uri.slice(1);
    const uriSend = uri.includes('?') ? uri.substr(0, uri.indexOf('?')) : uri;
    const expireTime = Math.floor(new Date().getTime() / 1000) + 3600;
    const neKeyUser = this.api_token + expireTime + this.suffix + uriSend;
    return this.helperCreateUrl(
      uri,
      query,
      browserInfo,
      method,
      neKeyUser,
      expireTime,
    );
  }

  createUrlV2(
    uri: string,
    query: QueryParams | null,
    browserInfo: BrowserInfo,
    method: string,
  ): string {
    if (uri[0] === '/') uri = uri.slice(1);
    const uriSend = uri.includes('?') ? uri.substr(0, uri.indexOf('?')) : uri;
    const expireTime = Math.floor(new Date().getTime() / 1000) + 3600;
    const neKeyUser = this.api_token + this.suffix + uriSend + expireTime;
    return this.helperCreateUrl(
      uri,
      query,
      browserInfo,
      method,
      neKeyUser,
      expireTime,
    );
  }

  helperCreateUrl(
    uri: string,
    query: QueryParams | null,
    browserInfo: BrowserInfo,
    _method: string,
    neKeyUser: string,
    expireTime: number,
  ): string {
    if (!query) query = {};
    if (uri[0] === '/') uri = uri.slice(1);
    const isAddQuestionMark = !uri.includes('?') ? true : false;
    query.st = base64(md5(neKeyUser))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    query.e = expireTime;
    query.device =
      browserInfo.name + encodeURIComponent(`(version:${browserInfo.version})`);
    query.drm = 1;
    if (uri && uri.includes('user/otp/login')) {
      const date = moment(new Date()).format('DD-MM-YYYY');
      query.since = date;
    }
    return this.api_url + uri + JsToUrlParams(isAddQuestionMark, query);
  }
}
