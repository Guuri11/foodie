import { useLocalSearchParams } from 'expo-router';

import { ProductDetailScreen } from '~/features/product-detail/screens/product-detail-screen';

export default function ProductDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ProductDetailScreen productId={id} />;
}
