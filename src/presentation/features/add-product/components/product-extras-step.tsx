import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { ProductLocation } from '@domain/product/value-objects';

import { Text } from '~/shared/ui/text';
import { LocationPicker } from '~/features/product-detail/components/location-picker';
import { QuantityInput } from '~/features/product-detail/components/quantity-input';

interface ProductExtrasStepProps {
  productName: string;
  suggestedLocation?: ProductLocation;
  suggestedQuantity?: string;
  onConfirm: (location?: ProductLocation, quantity?: string) => void;
  onSkip: () => void;
}

export function ProductExtrasStep({
  productName,
  suggestedLocation,
  suggestedQuantity,
  onConfirm,
  onSkip,
}: ProductExtrasStepProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState<ProductLocation | undefined>(suggestedLocation);
  const [quantity, setQuantity] = useState(suggestedQuantity ?? '');

  const handleConfirm = () => {
    const trimmedQuantity = quantity.trim();
    onConfirm(location, trimmedQuantity || undefined);
  };

  return (
    <View className="flex-1 gap-6 bg-background p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-foreground">{productName}</Text>
        <Text className="text-sm text-muted-foreground">{t('add_product.extras_subtitle')}</Text>
      </View>

      <LocationPicker value={location} onChange={setLocation} />
      <QuantityInput value={quantity} onChange={setQuantity} />

      <View className="mt-auto flex-row gap-3">
        <Pressable
          onPress={onSkip}
          className="flex-1 items-center rounded-xl border border-neutral-200 py-3"
        >
          <Text className="text-neutral-600">{t('add_product.extras_skip')}</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          className="flex-1 items-center rounded-xl bg-neutral-800 py-3"
        >
          <Text className="font-medium text-white">{t('add_product.extras_confirm')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
