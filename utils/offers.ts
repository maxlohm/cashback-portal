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
    description: 'Jetzt abschließen & bis zu 40 € Prämie sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V191135896B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C191135896B',
    category: 'versicherung',
    terms: [
      'Schließe eine Zahnzusatzversicherung ab.',
      'Erhalte 15 € von Bonus-Nest auf dein Prämienkonto.',
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
    id: 'verivox-kredit',
    name: 'Verivox Kreditvergleich',
    description: 'Jetzt Kredit vergleichen & 20 € Prämie sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V276463218B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C276463218B',
    category: 'kredit'
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
    description: 'Gasvertrag wechseln & 20 € sichern!',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=315&cat=3',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=315&deep=gasanbieter-wechseln&cat=3',
    category: 'vergleich'
  },
  {
    id: 'check24-strom',
    name: 'CHECK24 Stromvergleich',
    description: 'Bis zu 300 € Bonus + 30 € Prämie sichern!',
    reward: 30,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=305&cat=1',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=305&deep=stromanbieter-wechseln&cat=1',
    category: 'vergleich',
    terms: [
      '30 € Prämie für den erfolgreichen Anbieterwechsel über den Aktionslink – Gutschrift auf dein Bonus-Nest-Konto.',
      'Bis zu 300 € Neukundenbonus durch den Anbieter möglich.'
    ]
  },
  {
    id: 'check24-handy',
    name: 'CHECK24 Handytarife',
    description: 'Handytarif finden & 20 € Prämie sichern!',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=171&cat=7',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=171&deep=handytarife&cat=7',
    category: 'vergleich'
  },
  {
    id: 'check24-bank',
    name: 'C24 Bankkonto',
    description: 'Jetzt Bankkonto eröffnen & 20 € Prämie sichern!',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=342&cat=14',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=342&deep=c24bank&cat=14',
    category: 'kredit'
  },
  {
    id: 'santander-bestcredit',
    name: 'Santander BestCredit',
    description: 'Tagesgeld sichern mit 2,3 % Zinsen + 15 € Prämie!',
    reward: 15,
    image: 'https://www.financeads.net/tb.php?t=77500V19318415B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C19318415B',
    category: 'kredit'
  },
  {
    id: 'comdirect-girokonto',
    name: 'comdirect Girokonto',
    description: 'Jetzt kostenloses Girokonto eröffnen & 20 € sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V87024050B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C87024050B',
    category: 'kredit'
  },
  {
    id: 'commerzbank-geschaeftskonto',
    name: 'Commerzbank Geschäftskonto',
    description: 'Jetzt Geschäftskonto eröffnen & 20 € Prämie sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V304064420B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C304064420B',
    category: 'finanzen'
  },
  {
    id: 'advanzia-mastercard',
    name: 'Advanzia Mastercard GOLD',
    description: 'Kostenlose Kreditkarte beantragen & 20 € Prämie sichern!',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V13814265B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C13814265B',
    category: 'kredit'
  }
]