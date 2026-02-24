import CategoryPage from '../components/CategoryPage'

export default function FinanzenPage() {
  return (
    <CategoryPage
      title="Finanzen"
      categories={['finanzen', 'kredit']}
      emptyText="Aktuell keine Finanz-/Kredit-Angebote verfügbar."
      bannerSrc="/bannerrichtig.png"
      bannerAlt="Finanzen Banner"
    />
  )
}