import CategoryPage from '../components/CategoryPage'

export default function ShoppingPage() {
  return (
    <CategoryPage
      title="Shopping"
      categories={['shopping']}
      emptyText="Aktuell keine Shopping-Angebote verfügbar."
      bannerSrc="/bannerrichtig.png"
      bannerAlt="Shopping Banner"
    />
  )
}