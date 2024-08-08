/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      return config;
    },
  };

module.exports = nextConfig
