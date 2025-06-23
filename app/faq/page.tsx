'use client'

import Header from '../components/header'
import Footer from '../components/footer'

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-8 text-gray-800">
        <h1 className="text-3xl font-bold">Häufige Fragen (FAQ)</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">1. Wie funktioniert HydroCash?</h2>
            <p>
              HydroCash ist eine Prämienplattform, auf der du für die Teilnahme an Aktionen unserer Partner
              (z. B. Banken, Mobilfunkanbieter) belohnt wirst. Du wählst ein Angebot aus, nimmst daran teil, und
              nach erfolgreicher Bestätigung erhältst du Guthaben, das du im Prämienportal einlösen kannst.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. Was kostet die Nutzung von HydroCash?</h2>
            <p>
              Die Nutzung von HydroCash ist 100 % kostenlos. Du musst lediglich ein Nutzerkonto anlegen, um Angebote
              wahrzunehmen und Prämien zu erhalten.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Wie erhalte ich meine Prämien?</h2>
            <p>
              Nach erfolgreicher Teilnahme an einem Angebot wird dein Guthaben auf deinem HydroCash-Konto
              gutgeschrieben. Dieses kannst du im Prämienbereich gegen Gutscheine wie Amazon, eBay, Aral usw.
              einlösen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">4. Wie lange dauert es, bis ich meine Prämie bekomme?</h2>
            <p>
              Die Bearbeitungsdauer hängt vom jeweiligen Partner ab. In der Regel dauert es zwischen 2 und 8 Wochen,
              bis eine Teilnahme bestätigt und dein Guthaben freigegeben wird.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">5. Warum wurde meine Teilnahme nicht erkannt?</h2>
            <p>
              Damit deine Teilnahme korrekt erfasst wird, musst du Cookies zulassen und den Angebotslink direkt über
              HydroCash öffnen. AdBlocker oder VPNs können das Tracking verhindern. Nutze am besten einen sauberen
              Browser (Inkognito-Modus vermeiden).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">6. Wie kann ich mein Guthaben einlösen?</h2>
            <p>
              Gehe in deinem Benutzerkonto zum Bereich „Prämien einlösen“. Dort kannst du dein verfügbares Guthaben
              gegen Gutscheine bekannter Anbieter umwandeln.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">7. Gibt es eine Auszahlung auf Bankkonto oder PayPal?</h2>
            <p>
              Nein. Die Prämien werden ausschließlich über das interne HydroCash-Prämienportal in Form von Gutscheinen
              ausgezahlt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">8. Wie funktioniert das Empfehlungsprogramm?</h2>
            <p>
              Als Influencer oder aktiver Nutzer kannst du deinen persönlichen Empfehlungslink teilen. Für jeden
              erfolgreich geworbenen Neukunden erhältst du bis zu 50 % des Guthabens als Provision.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">9. Ist HydroCash seriös?</h2>
            <p>
              Ja! Wir arbeiten nur mit geprüften Partnerunternehmen und verwenden bewährte Affiliate-Tracking-Systeme.
              Deine Daten werden gemäß DSGVO geschützt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">10. Wie kann ich euch kontaktieren?</h2>
            <p>
              Du erreichst uns per E-Mail unter:{' '}
              <a href="mailto:hydroahsdjdsfgd@gmail.com" className="text-blue-600 underline">
                hydroahsdjdsfgd@gmail.com
              </a>. Wir bemühen uns, alle Anfragen schnellstmöglich zu beantworten.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}