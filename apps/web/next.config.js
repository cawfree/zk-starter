module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    const experiments = config.experiments || {}
    config.experiments = { ...experiments, asyncWebAssembly: true }
    return config;
  },
  experimental: {
    transpilePackages: []
  }
};
