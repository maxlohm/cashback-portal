/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.financeads.net' },
      { protocol: 'https', hostname: 'a.partner-versicherung.de' }, // für KFZ-Deal
    ],
  },
}

module.exports = nextConfig
