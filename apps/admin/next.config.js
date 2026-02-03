/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pepo/types', '@pepo/config'],
  output: 'standalone',
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;




