/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'placehold.co',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'i.pravatar.cc',
          pathname: '/**',
        },
      ],
    },
    allowedDevOrigins: [
      'https://9005-firebase-studio-1751826694069.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
    ],
    experiments: {
      asyncWebAssembly: true,
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });
      return config;
    },
  };
  
  export default nextConfig;
  