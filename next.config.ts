import type { NextConfig } from 'next';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const env = require('dotenv').config({
  path: path.join(__dirname, '/env/.env.' + process.env.ENVIRONMENT),
});

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

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
})(baseConfig);
