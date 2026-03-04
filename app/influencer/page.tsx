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
  return (i.followers.instagram ?? 0) + (i.followers.tiktok ?? 0) + (i.followers.whatsapp ?? 0)
}

type SortKey = 'relevance' | 'total' | 'instagram' | 'tiktok'

export default function InfluencerPage() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Influencer[]>([])
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('relevance')

  useEffect(() => {
    let alive = true

    const load = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('influencers')
        .select(
          `
          id, slug, name, display_name, image_url,
          instagram_url, tiktok_url, whatsapp_url,
          followers_instagram, followers_tiktok, followers_whatsapp,
          tags, featured, contact_label, contact_href, sort_order
        `,
        )
        .order('sort_order', { ascending: true })

      if (!alive) return

      if (error) {
        setError('Konnte Influencer nicht laden.')
        setRows([])
        setLoading(false)
        return
      }

      const mapped: Influencer[] = (data as InfluencerRow[]).map((r) => ({
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

    void load()
    return () => {
      alive = false
    }
  }, [])

  const { featured, rest, sumTotal, totalCount } = useMemo(() => {
    const q = query.trim().toLowerCase()

    const matches = rows.filter((i) => {
      if (!q) return true
      const hay = [i.displayName, i.name ?? '', ...i.tags].join(' ').toLowerCase()
      return hay.includes(q)
    })

    let sorted = [...matches]
    sorted.sort((a, b) => {
      if (sort === 'relevance') return 0
      if (sort === 'total') return totalFollowers(b) - totalFollowers(a)
      if (sort === 'instagram') return (b.followers.instagram ?? 0) - (a.followers.instagram ?? 0)
      if (sort === 'tiktok') return (b.followers.tiktok ?? 0) - (a.followers.tiktok ?? 0)
      return 0
    })

    const featuredItems = sorted.filter((i) => i.featured)
    const restItems = sorted.filter((i) => !i.featured)
    const sum = rows.reduce((acc, i) => acc + totalFollowers(i), 0)

    return {
      featured: featuredItems,
      rest: restItems,
      sumTotal: sum,
      totalCount: sorted.length,
    }
  }, [rows, query, sort])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Bonus-Nest Partner</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Unsere Influencer
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-600">
            Diese Creator teilen unsere Deals mit ihrer Community.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
              {loading ? '…' : `${totalCount} Creator`}
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
              Reichweite (öffentlich): <b className="text-gray-900">{loading ? '…' : formatNumber(sumTotal)}</b>
            </span>
          </div>

          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <Link
            href="/partner"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Partner werden
          </Link>
          <p className="text-xs text-gray-500">Provision pro bestätigtem Lead • Schnelles Setup</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen: Name, Tags (z.B. cashback, deals, sparen)…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-300"
        />

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Sortieren</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-gray-300"
          >
            <option value="relevance">Standard</option>
            <option value="total">Gesamt-Follower</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="h-6 w-40 rounded bg-gray-100" />
              <div className="mt-3 h-4 w-24 rounded bg-gray-100" />
              <div className="mt-6 h-24 rounded-2xl bg-gray-50" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-wide text-gray-900">Featured</h2>
                <span className="text-xs text-gray-500">Top-Reichweite</span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((i) => (
                  <InfluencerCard key={i.id} i={i} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            {featured.length > 0 && <h2 className="mb-3 text-sm font-bold tracking-wide text-gray-900">Alle</h2>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((i) => (
                <InfluencerCard key={i.id} i={i} />
              ))}
            </div>
          </section>

          {totalCount === 0 && (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Keine Treffer</p>
              <p className="mt-1 text-sm text-gray-600">Andere Sucheingabe probieren.</p>
            </div>
          )}
        </>
      )}

      <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">Du willst als Influencer mit Bonus-Nest arbeiten?</h3>
            <p className="mt-1 text-sm text-gray-200">
              Schreib uns kurz – wir erklären dir den Deal und geben dir deinen Link.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/partner"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100"
            >
              Partner werden
            </Link>
            <a
              href="mailto:partner@bonus-nest.de?subject=Partner%20Anfrage%20Bonus-Nest"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
            >
              Kontakt per E-Mail
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

function InfluencerCard({ i }: { i: Influencer }) {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          <Image src={i.image} alt={`${i.displayName} – Profilbild`} fill sizes="64px" className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold text-gray-900">{i.displayName}</h3>
                {i.featured && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                    Featured
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-gray-600">{i.name ? i.name : 'Creator'}</p>
            </div>

            <div className="rounded-xl bg-gray-50 px-3 py-2 text-right">
              <p className="text-[11px] font-medium text-gray-500">Gesamt</p>
              <p className="text-sm font-bold text-gray-900">{formatNumber(totalFollowers(i))}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {i.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3">
        <div className="rounded-xl bg-white px-3 py-2">
          <p className="text-[11px] font-medium text-gray-500">Instagram</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{formatNumber(i.followers.instagram)}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-2">
          <p className="text-[11px] font-medium text-gray-500">TikTok</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{formatNumber(i.followers.tiktok)}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-2">
          <p className="text-[11px] font-medium text-gray-500">WhatsApp</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{formatNumber(i.followers.whatsapp)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {i.instagramUrl && (
          <a
            href={i.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Instagram
          </a>
        )}
        {i.tiktokUrl && (
          <a
            href={i.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            TikTok
          </a>
        )}
        {i.whatsappUrl && (
          <a
            href={i.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            WhatsApp
          </a>
        )}

        {i.contact?.href && (
          <a
            href={i.contact.href}
            target={i.contact.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={i.contact.href.startsWith('mailto:') ? undefined : 'noreferrer'}
            className="ml-auto inline-flex items-center justify-center rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            {i.contact.label}
          </a>
        )}
      </div>
    </article>
  )
}