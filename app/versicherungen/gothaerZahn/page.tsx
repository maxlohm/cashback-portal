'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import KategorieNavigation from '@/app/navigation/page'
import Image from 'next/image'

export default function VersicherungenPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setLoggedIn(true)
      }
    }
    checkAuth()
  }, [])

  return (
     <>
       <KategorieNavigation />
 
       <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
         <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-[#003b5b]">
           💶 Finanzielle Angebote
         </h1>
 
         <div className="rounded-lg border border-gray-200 p-4 shadow-md hover:shadow-lg transition-all duration-300">
           <h2 className="text-lg font-semibold mb-2">Unser Partner: Finanzen.de</h2>
           <p className="text-sm text-gray-700 mb-4">
             Schließe eine Versicherung ab oder fordere ein kostenloses Angebot ein – und kassiere eine Prämie!
           </p>
           <div className="flex justify-center">
             <a
               href="https://www.financeads.net/tc.php?t=77500C191135896B"
               target="_blank"
               rel="noopener noreferrer"
             >
               <Image
                 src="https://www.financeads.net/tb.php?t=77500V191135896B"
                 alt="Finanzen.de Angebot"
                 width={300}
                 height={250}
                 className="rounded"
               />
             </a>
           </div>
         </div>
       </main>
     </>
   )
 }
 