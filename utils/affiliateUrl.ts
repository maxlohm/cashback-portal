/* ===========================
   Affiliate-URL-Helfer
   =========================== */

type SubIdParts = {
  userId: string
  offerId: string
  influencerId?: string | null
  /** Optional: Influencer-Code (profiles.partner_subid) */
  subId?: string | null
  /** Optional: Click-Token (clicks.subid_token) */
  clickToken?: string | null
}

function buildNetworkSubId(parts: SubIdParts): string {
  const s = (parts.subId || '').trim()
  const c = (parts.clickToken || '').trim()

  if (c.length > 0) {
    if (s.length > 0) return `${s}|${c}`
    return c
  }

  const infl = (parts.influencerId || 'none').trim()
  return `${parts.userId}|${parts.offerId}|${infl}`
}

function detectSubIdParam(hostname: string): 'clickref' | 'subid' | 'smc1' {
  const h = hostname.toLowerCase()
  if (h.includes('awin1.com')) return 'clickref'
  if (h.includes('financeads.net')) return 'subid'
  if (h.includes('belboon') || h.includes('janus.r.jakuli.com')) return 'smc1'
  return 'subid'
}

export function buildAffiliateUrl(
  baseUrl: string | null | undefined,
  parts: SubIdParts
): string | null {
  if (!baseUrl) return null

  try {
    const u = new URL(baseUrl)
    const key = detectSubIdParam(u.hostname)
    const token = buildNetworkSubId(parts)
    u.searchParams.set(key, token)
    return u.toString()
  } catch {
    return baseUrl ?? null
  }
}

export function buildAffiliateUrlLegacy(
  baseUrl: string | null | undefined,
  userId: string,
  offerId: string
): string | null {
  return buildAffiliateUrl(baseUrl, { userId, offerId })
}
