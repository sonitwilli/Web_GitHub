import { UAParser } from 'ua-parser-js';

export const userAgentInfo = () => {
  if (typeof window !== 'undefined') {
    try {
      const parser = new UAParser(navigator.userAgent);
      const res = parser.getResult();
      return {
        isSafari: !!res?.browser?.name?.toUpperCase()?.includes('SAFARI'),
        isEdge: !!res?.browser?.name?.toUpperCase()?.includes('EDGE'),
        isFromPc:
          !!res?.os?.name?.toLocaleUpperCase().includes('WINDOWS') ||
          !!res?.os?.name?.toUpperCase()?.includes('MACOS'),
        isWindows: !!res?.os?.name?.toLocaleUpperCase().includes('WINDOWS'),
        isFromAndroidOs: !!res?.os?.name?.toUpperCase()?.includes('ANDROID'),
        isMacOS: !!res?.os?.name?.toUpperCase()?.includes('MAC'),
        isFromIos: !!res?.os?.name?.toUpperCase()?.includes('IOS'),
        isFromIpad:
          !!res?.os?.name?.toUpperCase()?.includes('MAC') &&
          'ontouchend' in document,
        ...res,
      };
    } catch {}
  }
};
