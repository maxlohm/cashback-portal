'use client'

type Lead = {
  id: string
  offer_name: string
  created_at: string
  confirmed: boolean
  reward: number
}

export default function PartnerLeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-x-auto border rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium">Angebot</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Lead-Datum</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Vergütung (€)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white text-sm">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-2">{lead.offer_name}</td>
              <td className="px-4 py-2">{new Date(lead.created_at).toLocaleDateString('de-DE')}</td>
              <td className="px-4 py-2">
                {lead.confirmed ? (
                  <span className="text-green-600 font-medium">Bestätigt</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Offen</span>
                )}
              </td>
              <td className="px-4 py-2">{lead.reward.toFixed(2).replace('.', ',')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
