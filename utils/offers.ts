// utils/offers.ts

export type Offer = {
  id: string
  name: string
  description: string
  reward: number
  image: string
  affiliateUrl: string
  category: 'versicherung' | 'kredit' | 'vergleich' | 'finanzen'
  terms?: string[]
}

export const offers: Offer[] = [
  {
    id: 'gothaer-zahn',
    name: 'Gothaer Zahnzusatzversicherung',
    description: 'Jetzt 20 € & 40 € Prämie sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V191135896B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C191135896B',
    category: 'versicherung',
    terms: [
      'Schließe eine Zahnzusatzversicherung ab.',
      'Erhalte 20 € von Bonus-Nest auf dein Prämienkonto.',
      'Bei Duo 100 gibt es zusätzlich eine Zahnbürste im Wert von ca. 40 €.'
    ]
  },
  {
    id: 'kfz-versicherung',
    name: 'KFZ-Versicherung wechseln',
    description: '50 € sichern für den Wechsel deiner Autoversicherung!',
    reward: 50,
    image: 'https://a.partner-versicherung.de/view.php?partner_id=191406&ad_id=1618',
    affiliateUrl: 'https://a.partner-versicherung.de/click.php?partner_id=191406&ad_id=1618&deep=kfz-versicherung',
    category: 'versicherung',
    terms: [
      'Wechsle deine KFZ-Versicherung über Tarifcheck oder schließe einen neuen Vertrag ab.',
      'Erhalte 50 € von Bonus-Nest auf dein Prämienkonto für den gültigen Wechsel oder neuen Vertragsabschluss.',
      'Die Prämie wird am nächsten Werktag nach dem Wechsel oder Vertragsabschluss in deinem Bonus-Nest-Account vorgemerkt.'
    ]
  },
  {
    id: 'check24-dsl',
    name: 'CHECK24 DSL-Vergleich',
    description: 'DSL wechseln & doppelt sparen + Prämie sichern!',
    reward: 30,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=82&cat=4',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=82&deep=dsl-anbieterwechsel&cat=4',
    category: 'vergleich',
    terms: [
      'Jetzt DSL-Tarife über CHECK24 vergleichen und doppelt profitieren:',
      '✔ 30 € Prämie für deinen Abschluss',
      '✔ Bis zu 90 € Bonus & 265 € Cashback je nach Tarif'
    ]
  },
  {
    id: 'check24-gas',
    name: 'CHECK24 Gasvergleich',
    description: 'Gasvertrag wechseln & 10 € sichern!',
    reward: 10,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=315&cat=3',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=315&deep=gasanbieter-wechseln&cat=3',
    category: 'vergleich'
  },
  {
    id: 'check24-strom',
    name: 'CHECK24 Stromvergleich',
    description: 'Bis zu 300 € Bonus + 10 € Prämie sichern!',
    reward: 10,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=305&cat=1',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=305&deep=stromanbieter-wechseln&cat=1',
    category: 'vergleich',
    terms: [
      '10 € Prämie für den erfolgreichen Anbieterwechsel über den Aktionslink – Gutschrift auf dein Bonus-Nest-Konto.',
      'Bis zu 300 € Neukundenbonus durch den Anbieter möglich.'
    ]
  },
  {
    id: 'check24-handy',
    name: 'CHECK24 Handytarife',
    description: 'Handytarif finden & 10 € Prämie sichern!',
    reward: 10,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=171&cat=7',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=171&deep=handytarife&cat=7',
    category: 'vergleich'
  },
  {
    id: 'check24-bank',
    name: 'C24 Bankkonto',
    description: 'Jetzt Bankkonto eröffnen & 25 € + 75 € Prämie sichern!',
    reward: 25,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=342&cat=14',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=342&deep=c24bank&cat=14',
    category: 'kredit'
  },
  {
  id: 'santander-tagesgeld',
  name: 'Santander Tagesgeld',
  description: 'Kostenloses Tagesgeldkonto mit bis zu 2,30 % Zinsen p.a.',
  reward: 15,
  image: 'https://www.financeads.net/tb.php?t=77500V19399348B',
  affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C19399348B',
  category: 'kredit',
  terms: [
    'Eröffne das kostenlose Santander Tagesgeldkonto.',
    'Bis zu 2,30 % Zinsen p.a. – flexibel & ohne Mindestanlage.',
    '15 € Prämie für deine Kontoeröffnung über Bonus-Nest.'
  ]
},
{
  id: 'comdirect-tagesgeld-plus',
  name: 'comdirect Tagesgeld Plus',
  description: 'Jetzt Tagesgeldkonto eröffnen & 15 € sichern!',
  reward: 15,
  image: 'https://www.financeads.net/tb.php?t=77500V870106582B',
  affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C870106582B',
  category: 'kredit',
  terms: [
    'Eröffne ein Tagesgeld Plus Konto bei comdirect.',
    '15 € Bonus-Nest Prämie nach erfolgreicher Kontoeröffnung.'
  ]
},
{
  id: 'comdirect-depot',
  name: 'comdirect Depot',
  description: 'Depot eröffnen & 30 € Prämie sichern!',
  reward: 30,
  image: 'https://www.financeads.net/tb.php?t=77500V87024087B',
  affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C87024087B',
  category: 'kredit',
  terms: [
    'Jetzt Depot bei comdirect eröffnen.',
    '30 € Prämie von Bonus-Nest nach erfolgreicher Eröffnung.'
  ]
},
{
  id: 'commerzbank-direktdepot',
  name: 'Commerzbank DirektDepot',
  description: 'DirektDepot eröffnen & 30 € sichern!',
  reward: 30,
  image: 'https://www.financeads.net/tb.php?t=77500V304089374T',
  affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C304089374T',
  category: 'kredit',
  terms: [
    'Jetzt das DirektDepot bei der Commerzbank eröffnen.',
    '30 € Prämie von Bonus-Nest nach erfolgreicher Eröffnung.'
  ]
},
{
  id: 'commerzbank-topzinskonto',
  name: 'Commerzbank Topzinskonto',
  description: 'Topzinskonto eröffnen & 10 € Prämie sichern!',
  reward: 10,
  image: 'https://www.financeads.net/tb.php?t=77500V3040105286T',
  affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C3040105286T',
  category: 'kredit',
  terms: [
    'Eröffne das Topzinskonto Plus bei der Commerzbank.',
    '10 € Prämie für deine Kontoeröffnung über Bonus-Nest.'
  ]
},
{
  id: 'partner-kreditkarte',
  name: 'Kreditkarte mit 50 € Bonus',
  description: '50 € Willkommensbonus für deine Kreditkarte!',
  reward: 0,
  image: 'https://a.partner-versicherung.de/view.php?partner_id=191406&ad_id=1574',
  affiliateUrl: 'https://a.partner-versicherung.de/click.php?partner_id=191406&ad_id=1574&deep=kreditkarten',
  category: 'kredit',
  terms: [
    'Beantrage eine Kreditkarte über den Aktionslink.',
    '50 € Willkommensbonus direkt vom Anbieter (nicht über Bonus-Nest).'
  ]
},
{
  id: 'finanzguru',
  name: 'Finanzguru',
  description: 'Jetzt registrieren & 10 € Prämie sichern!',
  reward: 10,
  image: 'https://www.financeads.net/tb.php?t=77500V377273110B',
  affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C377273110B',
  category: 'kredit',
  terms: [
    'Registriere dich kostenlos bei Finanzguru.',
    '10 € Bonus-Nest Prämie nach erfolgreicher Registrierung.'
  ]
}
]