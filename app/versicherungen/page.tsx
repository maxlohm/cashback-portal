import CategoryPage from '../components/CategoryPage'

export default function VersicherungenPage() {
  return (
    <CategoryPage
      title="Versicherungen"
      categories={['versicherung']}
      emptyText="Aktuell keine Versicherungs-Angebote verfügbar."
      bannerAlt="Versicherungen Banner"
    />
  )
}