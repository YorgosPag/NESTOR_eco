// next.config.js
const nextConfig = {
    webpack: (config, { isServer }) => {
      config.experiments = { ...config.experiments, asyncWebAssembly: true };
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });
      return config;
    },
  };
  
  module.exports = nextConfig;
  