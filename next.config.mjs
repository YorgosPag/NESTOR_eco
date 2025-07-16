/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Note: genkit bundles 'express' which causes problems with Next.js's bundler.
    // We can mark it as external to avoid this issue.
    config.externals = [...config.externals, 'express'];
    return config;
  },
};

export default nextConfig;
