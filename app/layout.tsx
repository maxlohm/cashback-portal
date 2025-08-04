import './globals.css'
import { Inter } from 'next/font/google'
import Header from './components/header'
import Footer from './components/footer'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prämien-Portal | Bonus-Nest',
  description: 'Verdiene Geld durch Registrierungen bei Partnern',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Header />
        <main className="w-full px-4 sm:px-8 pt-8 pb-20 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
