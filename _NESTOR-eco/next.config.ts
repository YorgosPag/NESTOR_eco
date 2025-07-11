/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: [
      "https://9005-firebase-studio-1751826694069.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev"
    ]
  }
}

module.exports = nextConfig
