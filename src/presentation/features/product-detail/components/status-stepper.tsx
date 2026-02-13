import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { ProductStatus } from '@domain/product/value-objects';
import { PRODUCT_STATUSES } from '@domain/product/value-objects';

import { cn } from '~/core/utils/cn';

interface StatusStepperProps {
  currentStatus: ProductStatus;
  onStatusChange: (status: ProductStatus) => void;
}

const STATUS_INDEX: Record<ProductStatus, number> = {
  new: 0,
  opened: 1,
  almost_empty: 2,
  finished: 3,
};

export function StatusStepper({ currentStatus, onStatusChange }: StatusStepperProps) {
  const { t } = useTranslation();
  const currentIndex = STATUS_INDEX[currentStatus];

  return (
    <View className="gap-2">
      <Text className="text-sm text-neutral-500">{t('product_detail.status_label')}</Text>
      <View className="flex-row items-center">
        {PRODUCT_STATUSES.map((status, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const isFilled = isCurrent || isPast;

          return (
            <View key={status} className="flex-1 flex-row items-center">
              <View className="flex-1 items-center">
                <Pressable
                  onPress={() => onStatusChange(status)}
                  className={cn(
                    'h-8 w-8 items-center justify-center rounded-full',
                    isFilled ? 'bg-neutral-800' : 'bg-neutral-100'
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-bold',
                      isFilled ? 'text-white' : 'text-neutral-400'
                    )}
                  >
                    {index + 1}
                  </Text>
                </Pressable>
                <Text
                  className={cn(
                    'mt-1 text-center text-xs',
                    isCurrent ? 'font-medium text-neutral-800' : 'text-neutral-500'
                  )}
                  numberOfLines={1}
                >
                  {t(`product.status.${status}`)}
                </Text>
              </View>
              {index < PRODUCT_STATUSES.length - 1 && (
                <View
                  className={cn(
                    'mb-4 h-0.5 flex-1',
                    index < currentIndex ? 'bg-neutral-800' : 'bg-neutral-200'
                  )}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
