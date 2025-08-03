// utils/offers.tsx

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
    name: '',
    description: '',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V191135896B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C191135896B',
    category: 'versicherung',
    terms: [
      'Schließe eine Zahnzusatzversicherung ab.',
      'Erhalte 15 € von Bonus-Nest auf dein Prämienkonto für den gültigen Abschluss.',
      'Bei Abschluss des Tarifs Duo 100 erhältst du zusätzlich eine kostenlose elektrische Zahnbürste im Wert von ca. 40 €.'
    ]
  },
  {
    id: 'kfz-versicherung',
    name: '',
    description: '',
    reward: 20,
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
    name: '',
    description: '',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V276463218B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C276463218B',
    category: 'kredit'
  },
  {
    id: 'check24-dsl',
    name: '',
    description: '',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=82&cat=4',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=82&deep=dsl-anbieterwechsel&cat=4',
    category: 'vergleich',
    terms: [
      'Jetzt DSL-Tarife über CHECK24 vergleichen und doppelt profitieren:',
      '✔ 30 € Prämie für deinen Abschluss',
      '✔ Bis zu 90 € Bonus & 265 € Cashback je nach Tarif',
      'Tipp: Keine günstigen Angebote? Cookies löschen und neu starten.'
    ]
  },
  {
    id: 'check24-gas',
    name: '',
    description: '',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=315&cat=3',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=315&deep=gasanbieter-wechseln&cat=3',
    category: 'vergleich'
  },
  {
    id: 'check24-strom',
    name: '',
    description: '',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=305&cat=1',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=305&deep=stromanbieter-wechseln&cat=1',
    category: 'vergleich',
    terms: [
      'Die Aktion gilt für einen gültigen Anbieterwechsel zu einem neuen Stromversorger.',
      'Der neue Tarif muss eine Mindestvertragslaufzeit von 3 Monaten aufweisen.',
      '30 € Prämie für den erfolgreichen Anbieterwechsel über den Aktionslink – die Gutschrift erfolgt auf dein Bonus-Nest-Prämienkonto.',
      'Bis zu 300 € Neukundenbonus werden vom jeweiligen Stromanbieter gewährt – gemäß dessen Bedingungen.',
      'Zusätzlich bis zu 40 € Cashback erhältst du ggf. von Preisvergleich.de, abhängig vom gewählten Tarif und Anbieter.',
      'Die Auszahlung der einzelnen Prämien erfolgt separat durch Bonus-Nest, den Stromanbieter und ggf. Preisvergleich.de.'
    ]
  },
  {
    id: 'check24-handy',
    name: '',
    description: '',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=171&cat=7',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=171&deep=handytarife&cat=7',
    category: 'vergleich'
  },
  {
    id: 'check24-bank',
    name: '',
    description: '',
    reward: 20,
    image: 'https://a.check24.net/misc/view.php?pid=1153771&aid=342&cat=14',
    affiliateUrl: 'https://a.check24.net/misc/click.php?pid=1153771&aid=342&deep=c24bank&cat=14',
    category: 'kredit'
  },
  {
    id: 'santander-bestcredit',
    name: '',
    description: '',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V19318415B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C19318415B',
    category: 'kredit',
    terms: [
      'Die Aktion gilt ausschließlich für Neukunden, die noch kein Santander-Produkt besitzen.',
      'Eröffne ein kostenloses Tagesgeldkonto bei Santander.',
      'Erhalte 2,3 % Zinsen auf dein Guthaben.',
      'Nach der erfolgreichen Kontoeröffnung wird eine Prämie von 15 € auf dein Bonus-Nest-Prämienkonto gutgeschrieben – dies erfolgt wenige Tage nach der Eröffnung.',
      'Für eventuelle Nachbuchungsanfragen halte bitte die Order-Nummer bereit. Diese findest du links am Rand im Antragsdokument und beginnt mit OS-.'
    ]
  },
  {
    id: 'comdirect-girokonto',
    name: '',
    description: '',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V87024050B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C87024050B',
    category: 'kredit'
  },
  {
    id: 'commerzbank-geschaeftskonto',
    name: '',
    description: '',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V304064420B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C304064420B',
    category: 'finanzen'
  },
  {
    id: 'advanzia-mastercard',
    name: '',
    description: '',
    reward: 20,
    image: 'https://www.financeads.net/tb.php?t=77500V13814265B',
    affiliateUrl: 'https://www.financeads.net/tc.php?t=77500C13814265B',
    category: 'kredit'
  }
]
