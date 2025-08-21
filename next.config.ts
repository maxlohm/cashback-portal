/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.financeads.net', pathname: '/**' },
      { protocol: 'https', hostname: 'a.partner-versicherung.de', pathname: '/**' },
      { protocol: 'https', hostname: 'a.check24.net', pathname: '/misc/**' },
      { protocol: 'https', hostname: 'www.awin1.com', pathname: '/**' },
      { protocol: 'https', hostname: 'janus.r.jakuli.com', pathname: '/**' }, // ✅ Belboon
    ],
  },
}

module.exports = nextConfig
