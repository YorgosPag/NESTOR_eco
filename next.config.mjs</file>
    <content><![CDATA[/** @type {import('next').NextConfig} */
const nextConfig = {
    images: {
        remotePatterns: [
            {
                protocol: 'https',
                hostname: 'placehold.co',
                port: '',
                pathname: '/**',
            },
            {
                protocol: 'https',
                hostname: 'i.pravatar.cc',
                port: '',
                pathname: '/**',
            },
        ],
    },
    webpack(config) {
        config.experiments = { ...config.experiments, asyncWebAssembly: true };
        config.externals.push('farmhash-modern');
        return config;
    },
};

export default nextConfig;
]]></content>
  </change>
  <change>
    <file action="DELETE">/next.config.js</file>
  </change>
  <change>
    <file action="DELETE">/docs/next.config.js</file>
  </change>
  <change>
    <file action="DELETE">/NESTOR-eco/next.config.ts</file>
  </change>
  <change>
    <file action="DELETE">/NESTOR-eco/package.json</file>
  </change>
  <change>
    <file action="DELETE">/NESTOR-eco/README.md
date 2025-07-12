/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                port: '',
                pathname: '/**',
            },
        ],
    },
    webpack(config) {
        config.experiments = { ...config.experiments, asyncWebAssembly: true };
        config.externals.push('farmhash-modern');
        return config;
    },
};

export default nextConfig;