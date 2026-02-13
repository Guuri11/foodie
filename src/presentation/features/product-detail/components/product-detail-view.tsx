import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { Product } from '@domain/product/model';
import type { UrgencyInfo } from '@domain/product/urgency-messages';
import type { ProductLocation, ProductOutcome, ProductStatus } from '@domain/product/value-objects';

import { ExpiryDatePicker } from './expiry-date-picker';
import { LocationPicker } from './location-picker';
import { OutcomePrompt } from './outcome-prompt';
import { QuantityInput } from './quantity-input';
import { StatusStepper } from './status-stepper';
import { UrgencyBadge } from './urgency-badge';

interface ProductDetailViewProps {
  product: Product | null;
  urgencyInfo: UrgencyInfo;
  showOutcomePrompt: boolean;
  onLocationChange: (location: ProductLocation | undefined) => void;
  onQuantityChange: (quantity: string) => void;
  onStatusChange: (status: ProductStatus) => void;
  onExpiryDateChange: (date: Date | undefined) => void;
  onOutcomeSelect: (outcome: ProductOutcome) => void;
  onOutcomeDismiss: () => void;
}

export function ProductDetailView({
  product,
  urgencyInfo,
  showOutcomePrompt,
  onLocationChange,
  onQuantityChange,
  onStatusChange,
  onExpiryDateChange,
  onOutcomeSelect,
  onOutcomeDismiss,
}: ProductDetailViewProps) {
  const { t } = useTranslation();

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-neutral-500">{t('product_detail.not_found')}</Text>
      </View>
    );
  }

  const isEstimated = !product.expiryDate && !!product.estimatedExpiryDate;

  return (
    <View className="flex-1 gap-6 p-6">
      <Text className="text-2xl font-bold text-neutral-800">{product.name}</Text>
      <StatusStepper currentStatus={product.status} onStatusChange={onStatusChange} />
      {urgencyInfo.level !== 'ok' && (
        <UrgencyBadge urgencyInfo={urgencyInfo} isEstimated={isEstimated} />
      )}
      <ExpiryDatePicker
        expiryDate={product.expiryDate}
        estimatedExpiryDate={product.estimatedExpiryDate}
        onChange={onExpiryDateChange}
      />
      <LocationPicker value={product.location} onChange={onLocationChange} />
      <QuantityInput value={product.quantity} onChange={onQuantityChange} />
      <OutcomePrompt
        visible={showOutcomePrompt}
        onSelect={onOutcomeSelect}
        onDismiss={onOutcomeDismiss}
      />
    </View>
  );
}
