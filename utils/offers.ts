// utils/offers.tsx

export type Offer = {
  id: string
  name: string
  description: string
  reward: number
  image: string
  affiliateUrl: string
  category: 'versicherung' | 'kredit' | 'vergleich' | 'finanzen'
}

export const offers: Offer[] = [
  {
    id: 'gothaer-zahn',
    name: 'Gothaer Zahnzusatzversicherung',
    description: 'Ab 5,50 € im Monat – jetzt abschließen & Prämie sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V191135896B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C191135896B',
    category: 'versicherung',
  },
  {
    id: 'kfz-versicherung',
    name: 'Kfz-Versicherung',
    description: 'Jetzt Kfz-Versicherung abschließen & 20 € sichern!',
    reward: 20,
    image: 'https://a.partner-versicherung.de/view.php?partner_id=191406&ad_id=1618',
    affiliateUrl: 'https://a.partner-versicherung.de/click.php?partner_id=191406&ad_id=1618&deep=kfz-versicherung',
    category: 'versicherung',
  },
  {
    id: 'verivox-kredit',
    name: 'Verivox Kredit',
    description: 'Top-Konditionen für deinen Ratenkredit sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V276463218B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C276463218B',
    category: 'kredit',
  },
  {
    id: 'check24-dsl',
    name: 'CHECK24 DSL',
    description: 'Schnellen DSL-Anschluss vergleichen & 20 € sichern!',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=82&cat=4',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=82&deep=dsl-anbieterwechsel&cat=4',
    category: 'vergleich',
  },
  {
    id: 'check24-gas',
    name: 'CHECK24 Gas',
    description: 'Jetzt Gasanbieter wechseln & Prämie sichern!',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=315&cat=3',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=315&deep=gasanbieter-wechseln&cat=3',
    category: 'vergleich',
  },
  {
    id: 'check24-strom',
    name: 'CHECK24 Strom',
    description: 'Stromanbieter wechseln & Prämie sichern!',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=305&cat=1',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=305&deep=stromanbieter-wechseln&cat=1',
    category: 'vergleich'
  },
  {
  id: 'check24-handy',
  name: 'CHECK24 Handytarife',
  description: 'Top Handytarife vergleichen & Prämie sichern!',
  reward: 20, // Passe die Prämie ggf. an
  image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=171&cat=7',
  affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=171&deep=handytarife&cat=7',
  category: 'vergleich'
},
{
  id: 'check24-bank',
  name: 'CHECK24 Bank',
  description: 'CHECK24 Banking-Angebote vergleichen & Prämie sichern!',
  reward: 20, // Passe ggf. an
  image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=342&cat=14',
  affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=342&deep=c24bank&cat=14',
  category: 'kredit' // Oder 'finanzen', wenn du diese Kategorie verwendest
},
{
    id: 'advanzia-mastercard',
    name: 'Advanzia Mastercard Gold',
    description: 'Kostenlose Advanzia Mastercard Gold beantragen & Prämie sichern!',
    reward: 20, // Passe den Wert ggf. an
    image: 'https://www.financeads.net/tb.php?t=77500V13814265B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C13814265B',
    category: 'kredit',
  }
]
