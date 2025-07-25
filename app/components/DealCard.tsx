// components/DealCard.tsx

type DealCardProps = {
  name: string
  description: string
  reward: number
  image: string
  onClick: () => void
}

export default function DealCard({ name, description, reward, image, onClick }: DealCardProps) {
  return (
    <div className="w-full md:w-[48%] flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg border shadow hover:shadow-lg transition-all">
      <div style={{ width: 300, height: 250 }} className="flex-shrink-0 flex items-center justify-center bg-white">
        <img
          src={image}
          alt={name}
          width={300}
          height={250}
          style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
          className="rounded"
        />
      </div>
      <div className="flex flex-col items-center gap-5">
        <div className="bg-[#ca4b24] text-white px-8 py-3 rounded-lg text-xl font-bold min-w-[160px] text-center">
          {reward} €
        </div>
        <button
          onClick={onClick}
          className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
        >
          Jetzt sichern!
        </button>
      </div>
    </div>
  )
}
