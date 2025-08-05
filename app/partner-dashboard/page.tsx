'use client'

export const dynamic = 'force-dynamic'

export default function PartnerDashboardPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Partner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatBox label="Leads insgesamt" value={42} />
        <StatBox label="Abgeschlossene Deals" value={17} />
        <StatBox label="Provisionssumme" value="123,45 €" />
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Lead-Verlauf</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Datum</th>
              <th className="py-2">Angebot</th>
              <th className="py-2">Betrag</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">01.08.2025</td>
              <td className="py-2">Vodafone</td>
              <td className="py-2">15,00 €</td>
              <td className="py-2">Offen</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">30.07.2025</td>
              <td className="py-2">Trade Republic</td>
              <td className="py-2">25,00 €</td>
              <td className="py-2">Ausbezahlt</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
