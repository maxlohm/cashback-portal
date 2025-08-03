/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.financeads.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.partner-versicherung.de',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.check24.net',
        pathname: '/misc/**', // wichtig: view.php liegt unter /misc/
      },
    ],
  },
}

module.exports = nextConfig
