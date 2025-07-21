// components/StatBox.tsx
type StatBoxProps = {
  label: string
  value: string | number
  highlight?: boolean
}

export default function StatBox({ label, value, highlight = false }: StatBoxProps) {
  return (
    <div className={`rounded-xl p-4 shadow-md border bg-white flex flex-col justify-center items-center text-center 
      ${highlight ? 'border-yellow-500' : 'border-gray-200'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
