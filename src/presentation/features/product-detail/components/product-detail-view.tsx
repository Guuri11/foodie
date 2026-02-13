import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { Product } from '@domain/product/model';
import type { ProductLocation } from '@domain/product/value-objects';

import { LocationPicker } from './location-picker';
import { QuantityInput } from './quantity-input';

interface ProductDetailViewProps {
  product: Product | null;
  onLocationChange: (location: ProductLocation | undefined) => void;
  onQuantityChange: (quantity: string) => void;
}

export function ProductDetailView({
  product,
  onLocationChange,
  onQuantityChange,
}: ProductDetailViewProps) {
  const { t } = useTranslation();

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-neutral-500">{t('product_detail.not_found')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 gap-6 p-6">
      <Text className="text-2xl font-bold text-neutral-800">{product.name}</Text>
      <LocationPicker value={product.location} onChange={onLocationChange} />
      <QuantityInput value={product.quantity} onChange={onQuantityChange} />
    </View>
  );
}
