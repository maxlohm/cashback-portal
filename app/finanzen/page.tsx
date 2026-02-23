import CategoryPage from '../components/CategoryPage'

export default function FinanzenPage() {
  return (
    <CategoryPage
      title="Finanzen"
      categories={['finanzen', 'kredit']}
      emptyText="Aktuell keine Finanz-/Kredit-Angebote verfügbar."
      bannerAlt="Finanzen Banner"
    />
  )
}