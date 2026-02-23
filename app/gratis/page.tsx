import CategoryPage from '../components/CategoryPage'

export default function GratisPage() {
  return (
    <CategoryPage
      title="Gratis"
      categories={['gratis']}
      emptyText="Aktuell keine Gratis-Angebote verfügbar."
      bannerAlt="Gratis Banner"
    />
  )
}