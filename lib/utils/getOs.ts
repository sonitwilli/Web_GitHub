const OS_MAP = {
  WindowsPhone: 'Windows Phone',
  Windows: 'Windows',
  MacOS: 'macOS',
  iOS: 'iOS',
  Android: 'Android',
  WebOS: 'WebOS',
  BlackBerry: 'BlackBerry',
  Bada: 'Bada',
  Tizen: 'Tizen',
  Linux: 'Linux',
  ChromeOS: 'Chrome OS',
  PlayStation4: 'PlayStation 4',
  Roku: 'Roku',
};

const osList = [
  /* Roku */
  {
    test: [/Roku\/DVP/],
    describe: () => ({
      name: OS_MAP.Roku,
    }),
  },

  /* Windows Phone */
  {
    test: [/windows phone/i],
    describe: () => ({
      name: OS_MAP.WindowsPhone,
    }),
  },

  /* Windows */
  {
    test: [/windows /i],
    describe: () => ({
      name: OS_MAP.Windows,
    }),
  },

  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe: () => ({
      name: OS_MAP.iOS,
    }),
  },

  /* macOS */
  {
    test: [/macintosh/i],
    describe: () => ({
      name: OS_MAP.MacOS,
    }),
  },

  /* iOS */
  {
    test: [/(ipod|iphone|ipad)/i],
    describe: () => ({
      name: OS_MAP.iOS,
    }),
  },

  /* Android */
  {
    test(ua: string) {
      const notLikeAndroid = !/like android/i.test(ua);
      const butAndroid = /android/i.test(ua);
      return notLikeAndroid && butAndroid;
    },
    describe: () => ({
      name: OS_MAP.Android,
    }),
  },

  /* WebOS */
  {
    test: [/(web|hpw)[o0]s/i],
    describe: () => ({
      name: OS_MAP.WebOS,
    }),
  },

  /* BlackBerry */
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe: () => ({
      name: OS_MAP.BlackBerry,
    }),
  },

  /* Bada */
  {
    test: [/bada/i],
    describe: () => ({
      name: OS_MAP.Bada,
    }),
  },

  /* Tizen */
  {
    test: [/tizen/i],
    describe: () => ({
      name: OS_MAP.Tizen,
    }),
  },

  /* Linux */
  {
    test: [/linux/i],
    describe() {
      return {
        name: OS_MAP.Linux,
      };
    },
  },

  /* Chrome OS */
  {
    test: [/CrOS/],
    describe: () => ({
      name: OS_MAP.ChromeOS,
    }),
  },

  /* Playstation 4 */
  {
    test: [/PlayStation 4/],
    describe: () => ({
      name: OS_MAP.PlayStation4,
    }),
  },
];

const getOs = (ua: string) => {
  const osDescriptor = osList.find((os) => {
    if (typeof os.test === 'function') {
      return os.test(ua);
    }

    return os.test.some((condition) => condition.test(ua));
  });

  return osDescriptor ? osDescriptor.describe() : null;
};

export default getOs;
