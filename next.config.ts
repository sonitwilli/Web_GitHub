import type { NextConfig } from 'next';
import path from 'path';
import { withSentryConfig } from '@sentry/nextjs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const env = require('dotenv').config({
  path: path.join(__dirname, '/env/.env.' + process.env.ENVIRONMENT),
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa');
const isDev = process.env.NODE_ENV === 'development';

const baseConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    ppr: false,
  },
  env: {
    ...env.parsed,
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fplchat-staging.fptplay.vn',
      },
      {
        protocol: 'https',
        hostname: 'fplchat.fptplay.vn',
      },
    ],
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
})(baseConfig);

export default withSentryConfig(pwaConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'fpt-play-1m',
  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
