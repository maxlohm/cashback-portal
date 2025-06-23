import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cashback-Portal',
  description: 'Verdiene Geld durch Registrierungen bei Partnern',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-white text-gray-900 min-h-screen`}>
        <main className="w-full px-4 sm:px-8 pt-8 pb-20">
          {children}
        </main>
      </body>
    </html>
  )
}
