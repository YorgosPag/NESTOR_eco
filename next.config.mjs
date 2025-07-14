/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        config.externals.push('firebase-admin');
        return config;
    },
    experimental: {
        serverExternalPackages: ['@opentelemetry/winston-transport', 'winston'],
    }
};

export default nextConfig;
