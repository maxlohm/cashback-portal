'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

type InfluencerRow = {
  id: string
  slug: string
  name: string | null
  display_name: string
  image_url: string
  instagram_url: string | null
  tiktok_url: string | null
  whatsapp_url: string | null
  followers_instagram: number | null
  followers_tiktok: number | null
  followers_whatsapp: number | null
  tags: string[] | null
  featured: boolean
  contact_label: string | null
  contact_href: string | null
  sort_order: number
}

type Influencer = {
  id: string
  displayName: string
  name: string | null
  image: string
  instagramUrl?: string
  tiktokUrl?: string
  whatsappUrl?: string
  followers: { instagram?: number; tiktok?: number; whatsapp?: number }
  tags: string[]
  featured?: boolean
  contact?: { label: string; href: string }
}

function formatNumber(n?: number) {
  if (!n) return '—'
  return new Intl.NumberFormat('de-DE').format(n)
}

function totalFollowers(i: Influencer) {
  return (i.followers.instagram ?? 0) +
    (i.followers.tiktok ?? 0) +
    (i.followers.whatsapp ?? 0)
}

type SortKey = 'relevance' | 'total' | 'instagram' | 'tiktok'

export default function InfluencerPage() {

  const [rows, setRows] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('relevance')

  useEffect(() => {

    const load = async () => {

      const { data } = await supabase
        .from('influencers')
        .select('*')
        .eq('active', true)
        .order('sort_order')

      if (!data) return

      const mapped: Influencer[] = data.map((r: InfluencerRow) => ({
        id: r.id,
        displayName: r.display_name,
        name: r.name,
        image: r.image_url,
        instagramUrl: r.instagram_url ?? undefined,
        tiktokUrl: r.tiktok_url ?? undefined,
        whatsappUrl: r.whatsapp_url ?? undefined,
        followers: {
          instagram: r.followers_instagram ?? undefined,
          tiktok: r.followers_tiktok ?? undefined,
          whatsapp: r.followers_whatsapp ?? undefined,
        },
        tags: r.tags ?? [],
        featured: r.featured,
        contact:
          r.contact_label && r.contact_href
            ? { label: r.contact_label, href: r.contact_href }
            : undefined,
      }))

      setRows(mapped)
      setLoading(false)
    }

    load()

  }, [])

  const { featured, rest, sumTotal, totalCount } = useMemo(() => {

    const q = query.toLowerCase()

    const matches = rows.filter((i) => {

      if (!q) return true

      const hay = [i.displayName, i.name ?? '', ...i.tags]
        .join(' ')
        .toLowerCase()

      return hay.includes(q)

    })

    let sorted = [...matches]

    sorted.sort((a, b) => {

      if (sort === 'total') return totalFollowers(b) - totalFollowers(a)

      if (sort === 'instagram')
        return (b.followers.instagram ?? 0) -
          (a.followers.instagram ?? 0)

      if (sort === 'tiktok')
        return (b.followers.tiktok ?? 0) -
          (a.followers.tiktok ?? 0)

      return 0
    })

    const featured = sorted.filter((i) => i.featured)
    const rest = sorted.filter((i) => !i.featured)

    const sum = rows.reduce((acc, i) => acc + totalFollowers(i), 0)

    return {
      featured,
      rest,
      sumTotal: sum,
      totalCount: sorted.length,
    }

  }, [rows, query, sort])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">

      {/* Header */}

      <div>
        <p className="text-sm text-gray-500">Bonus-Nest Partner</p>

        <h1 className="text-4xl font-bold mt-2">
          Unsere Influencer
        </h1>

        <p className="text-gray-600 mt-3">
          Diese Creator teilen unsere Deals mit ihrer Community.
        </p>

        <div className="flex gap-2 mt-4 flex-wrap">

          <span className="border rounded-full px-3 py-1 text-sm">
            {totalCount} Creator
          </span>

          <span className="border rounded-full px-3 py-1 text-sm">
            Reichweite (öffentlich): <b>{formatNumber(sumTotal)}</b>
          </span>

        </div>
      </div>

      {/* Suche */}

      <div className="mt-8 border rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center">

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen: Name, Tags (z.B. cashback, deals, sparen)..."
          className="flex-1 border rounded-lg px-4 py-2"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="relevance">Standard</option>
          <option value="total">Gesamt-Follower</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
        </select>

      </div>

      {/* Featured */}

      {featured.length > 0 && (
        <section className="mt-10">

          <h2 className="text-sm font-bold mb-4">
            Featured
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((i) => (
              <InfluencerCard key={i.id} i={i} />
            ))}
          </div>

        </section>
      )}

      {/* Alle */}

      <section className="mt-10">

        {featured.length > 0 && (
          <h2 className="text-sm font-bold mb-4">
            Alle
          </h2>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {rest.map((i) => (
            <InfluencerCard key={i.id} i={i} />
          ))}

        </div>

      </section>

      {/* CTA unten */}

      <div className="mt-16 bg-[#0b1c34] text-white rounded-2xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>
          <h3 className="text-lg font-bold">
            Du willst als Influencer mit Bonus-Nest arbeiten?
          </h3>

          <p className="text-sm text-gray-200 mt-1">
            Schreib uns kurz – wir erklären dir den Deal und geben dir deinen Link.
          </p>
        </div>

        <div className="flex gap-3">

          <Link
            href="/partner"
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
          >
            Partner werden
          </Link>

          <a
            href="mailto:partner@bonus-nest.de"
            className="border border-white px-4 py-2 rounded-lg"
          >
            Kontakt per E-Mail
          </a>

        </div>

      </div>

    </main>
  )
}

function InfluencerCard({ i }: { i: Influencer }) {

  return (

    <div className="border rounded-2xl p-5 shadow-sm">

      <div className="flex gap-4 items-start">

        <Image
          src={i.image}
          alt={i.displayName}
          width={64}
          height={64}
          className="rounded-xl"
        />

        <div className="flex-1">

          <div className="flex justify-between">

            <div>
              <h3 className="font-bold text-lg">
                {i.displayName}
              </h3>

              <p className="text-sm text-gray-600">
                {i.name ?? 'Creator'}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Gesamt <b>{formatNumber(totalFollowers(i))}</b>
            </div>

          </div>

          <div className="flex gap-2 mt-3 flex-wrap">

            {i.tags.map((t) => (
              <span
                key={t}
                className="border rounded-full px-3 py-1 text-xs"
              >
                {t}
              </span>
            ))}

          </div>

        </div>

      </div>

      {/* Follower */}

      <div className="grid grid-cols-3 gap-2 mt-5">

        <Stat label="Instagram" value={i.followers.instagram} />
        <Stat label="TikTok" value={i.followers.tiktok} />
        <Stat label="WhatsApp" value={i.followers.whatsapp} />

      </div>

      {/* Buttons */}

      <div className="flex gap-2 flex-wrap mt-5">

        {i.instagramUrl && (
          <a href={i.instagramUrl} target="_blank">Instagram</a>
        )}

        {i.tiktokUrl && (
          <a href={i.tiktokUrl} target="_blank">TikTok</a>
        )}

        {i.whatsappUrl && (
          <a href={i.whatsappUrl} target="_blank">WhatsApp</a>
        )}

        {i.contact && (
          <a
            href={i.contact.href}
            target="_blank"
            className="ml-auto bg-black text-white px-3 py-2 rounded-lg"
          >
            {i.contact.label}
          </a>
        )}

      </div>

    </div>

  )
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="border rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold">{value ? formatNumber(value) : '—'}</p>
    </div>
  )
}