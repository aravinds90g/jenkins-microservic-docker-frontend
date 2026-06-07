import { ProductPageClient } from "@/components/product-page-client"

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductPageClient productId={params.id} />
}
