import { SafeScreen } from '~/shared/components/safe-screen';

import { ProductDetailView } from '../components/product-detail-view';
import { useProductDetail } from '../hooks/use-product-detail';

interface ProductDetailScreenProps {
  productId: string;
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const {
    product,
    setLocation,
    setQuantity,
    setStatus,
    setExpiryDate,
    urgencyInfo,
    showOutcomePrompt,
    finishWithOutcome,
    dismissOutcomePrompt,
  } = useProductDetail(productId);

  return (
    <SafeScreen>
      <ProductDetailView
        product={product}
        urgencyInfo={urgencyInfo}
        showOutcomePrompt={showOutcomePrompt}
        onLocationChange={setLocation}
        onQuantityChange={setQuantity}
        onStatusChange={setStatus}
        onExpiryDateChange={setExpiryDate}
        onOutcomeSelect={finishWithOutcome}
        onOutcomeDismiss={dismissOutcomePrompt}
      />
    </SafeScreen>
  );
}
