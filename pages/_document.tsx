import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/images/pwa/192.png" />
        <meta name="description" content="Nextjs" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
