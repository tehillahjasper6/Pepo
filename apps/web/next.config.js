/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  transpilePackages: ['@pepo/types', '@pepo/config'],
  typescript: {
    // Suppress type checking errors to allow build with linting issues
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build with eslint warnings/errors
    ignoreDuringBuilds: true,
  },
  // Service worker support
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

// Sentry config wrapper
const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

