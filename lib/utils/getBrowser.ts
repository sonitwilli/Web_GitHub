/* eslint-disable @typescript-eslint/no-explicit-any */
import getFirstMatch from './getFirstMatch';
import getSecondMatch from './getSecondMatch';

const commonVersionIdentifier = /version\/(\d+(\.?_?\d+)+)/i;

const browsersList = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe: (ua: string) => ({
      name: 'Googlebot',
      version:
        getFirstMatch(/googlebot\/(\d+(\.\d+))/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },

  /* Opera < 13.0 */
  {
    test: [/opera/i],
    describe: (ua: string) => ({
      name: 'Opera',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },

  /* Opera > 13.0 */
  {
    test: [/opr\/|opios/i],
    describe: (ua: string) => ({
      name: 'Opera',
      version:
        getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/SamsungBrowser/i],
    describe: (ua: string) => ({
      name: 'Samsung Internet for Android',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/Whale/i],
    describe: (ua: string) => ({
      name: 'NAVER Whale Browser',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, ua),
    }),
  },
  {
    test: [/MZBrowser/i],
    describe: (ua: string) => ({
      name: 'MZ Browser',
      version:
        getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/focus/i],
    describe: (ua: string) => ({
      name: 'Focus',
      version:
        getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/swing/i],
    describe: (ua: string) => ({
      name: 'Swing',
      version:
        getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/coast/i],
    describe: (ua: string) => ({
      name: 'Opera Coast',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/opt\/\d+(?:.?_?\d+)+/i],
    describe: (ua: string) => ({
      name: 'Opera Touch',
      version:
        getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/yabrowser/i],
    describe: (ua: string) => ({
      name: 'Yandex Browser',
      version:
        getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/ucbrowser/i],
    describe: (ua: string) => ({
      name: 'UC Browser',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/Maxthon|mxios/i],
    describe: (ua: string) => ({
      name: 'Maxthon',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/epiphany/i],
    describe: (ua: string) => ({
      name: 'Epiphany',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/puffin/i],
    describe: (ua: string) => ({
      name: 'Puffin',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/sleipnir/i],
    describe: (ua: string) => ({
      name: 'Sleipnir',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/k-meleon/i],
    describe: (ua: string) => ({
      name: 'K-Meleon',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/micromessenger/i],
    describe: (ua: string) => ({
      name: 'WeChat',
      version:
        getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/qqbrowser/i],
    describe: (ua: string) => ({
      name: /qqbrowserlite/i.test(ua) ? 'QQ Browser Lite' : 'QQ Browser',
      version:
        getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/msie|trident/i],
    describe: (ua: string) => ({
      name: 'Internet Explorer',
      version: getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/\sedg\//i],
    describe: (ua: string) => ({
      name: 'Microsoft Edge',
      version: getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/edg([ea]|ios)/i],
    describe: (ua: string) => ({
      name: 'Microsoft Edge',
      version: getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/vivaldi/i],
    describe: (ua: string) => ({
      name: 'Vivaldi',
      version: getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/seamonkey/i],
    describe: (ua: string) => ({
      name: 'SeaMonkey',
      version: getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/sailfish/i],
    describe: (ua: string) => ({
      name: 'Sailfish',
      version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, ua),
    }),
  },
  {
    test: [/silk/i],
    describe: (ua: string) => ({
      name: 'Amazon Silk',
      version: getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/phantom/i],
    describe: (ua: string) => ({
      name: 'PhantomJS',
      version: getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/slimerjs/i],
    describe: (ua: string) => ({
      name: 'SlimerJS',
      version: getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe: (ua: string) => ({
      name: 'BlackBerry',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/(web|hpw)[o0]s/i],
    describe: (ua: string) => ({
      name: 'WebOS Browser',
      version:
        getFirstMatch(commonVersionIdentifier, ua) ||
        getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/bada/i],
    describe: (ua: string) => ({
      name: 'Bada',
      version: getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/tizen/i],
    describe: (ua: string) => ({
      name: 'Tizen',
      version:
        getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/qupzilla/i],
    describe: (ua: string) => ({
      name: 'QupZilla',
      version:
        getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/firefox|iceweasel|fxios/i],
    describe: (ua: string) => ({
      name: 'Firefox',
      version: getFirstMatch(
        /(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i,
        ua,
      ),
    }),
  },
  {
    test: [/electron/i],
    describe: (ua: string) => ({
      name: 'Electron',
      version: getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/MiuiBrowser/i],
    describe: (ua: string) => ({
      name: 'Miui',
      version: getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/chromium/i],
    describe: (ua: string) => ({
      name: 'Chromium',
      version:
        getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
        getFirstMatch(commonVersionIdentifier, ua),
    }),
  },
  {
    test: [/coc_coc_browser/i],
    describe: (ua: string) => ({
      name: 'coc_coc_browser',
      version: getFirstMatch(/(?:coc_coc_browser)[\s/](\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/chrome|crios|crmo/i],
    describe: (ua: string) => ({
      name: 'Chrome',
      version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },
  {
    test: [/GSA/i],
    describe: (ua: string) => ({
      name: 'Google Search',
      version: getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, ua),
    }),
  },

  /* Android Browser */
  {
    test: (ua: string) => {
      const notLikeAndroid = !/like android/i.test(ua);
      const butAndroid = /android/i.test(ua);
      return notLikeAndroid && butAndroid;
    },
    describe: (ua: string) => ({
      name: 'Android Browser',
      version: getFirstMatch(commonVersionIdentifier, ua),
    }),
  },

  /* PlayStation 4 */
  {
    test: [/playstation 4/i],
    describe: (ua: string) => ({
      name: 'PlayStation 4',
      version: getFirstMatch(commonVersionIdentifier, ua),
    }),
  },

  /* Safari */
  {
    test: [/safari|applewebkit/i],
    describe: (ua: string) => ({
      name: 'Safari',
      version: getFirstMatch(commonVersionIdentifier, ua),
    }),
  },

  /* Something else */
  {
    test: [/.*/i],
    describe(ua: string) {
      const regexpWithoutDeviceSpec = /^(.*)\/(.*) /;
      const regexpWithDeviceSpec = /^(.*)\/(.*)[ \t]\((.*)/;
      const hasDeviceSpec = ua.search('\\(') !== -1;
      const regexp = hasDeviceSpec
        ? regexpWithDeviceSpec
        : regexpWithoutDeviceSpec;
      return {
        name: getFirstMatch(regexp, ua),
        version: getSecondMatch(regexp, ua),
      };
    },
  },
];
const userAgentDataSupported = ['chrome', 'edge', 'opera', 'coccoc'];
const getBrowser = (ua: string) => {
  const browserDescriptor = browsersList.find((browser) => {
    if (typeof browser.test === 'function') {
      return browser.test(ua);
    }

    return browser.test.some((condition) => condition.test(ua));
  });

  return browserDescriptor ? browserDescriptor.describe(ua) : null;
};

export default getBrowser;
export type getBrowserType = ReturnType<typeof getBrowser>;
export const browserRealVersion = async () => {
  const ua = navigator.userAgent || '';
  const browser = getBrowser(ua);

  try {
    if ((window?.navigator as any)?.userAgentData?.getHighEntropyValues) {
      const response = await (
        window?.navigator as any
      )?.userAgentData.getHighEntropyValues([
        'architecture',
        'model',
        'platformVersion',
        'fullVersionList',
      ]);
      if (!response || !response?.fullVersionList) return browser;
      const foundVersion = (response?.fullVersionList || [])?.find(
        (item: any) =>
          userAgentDataSupported.some((browser) =>
            item?.brand.toLowerCase().includes(browser),
          ),
      );
      if (!foundVersion) return browser;
      return {
        name: foundVersion?.brand || '',
        version: foundVersion?.version || '',
      };
    }
    return browser;
  } catch {
    return browser;
  }
};
