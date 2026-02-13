import { ProductDetailView } from '../components/product-detail-view';
import { useProductDetail } from '../hooks/use-product-detail';

interface ProductDetailScreenProps {
  productId: string;
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const { product, setLocation, setQuantity } = useProductDetail(productId);

  return (
    <ProductDetailView
      product={product}
      onLocationChange={setLocation}
      onQuantityChange={setQuantity}
    />
  );
}
