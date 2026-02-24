import CategoryPage from '../components/CategoryPage'

export default function MobilfunkPage() {
  return (
    <CategoryPage
      title="Mobilfunk"
      categories={['mobilfunk']}
      emptyText="Aktuell keine Mobilfunk-Angebote verfügbar."
      bannerSrc="/bannerrichtig.png"
      bannerAlt="Mobilfunk Banner"
    />
  )
}