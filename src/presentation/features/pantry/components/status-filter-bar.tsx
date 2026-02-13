import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

import type { ProductStatus } from '@domain/product/value-objects';

import { cn } from '~/core/utils/cn';

interface StatusFilterBarProps {
  selectedStatus: ProductStatus | 'all';
  onStatusChange: (status: ProductStatus | 'all') => void;
}

const FILTERS: Array<{ key: ProductStatus | 'all'; labelKey: string }> = [
  { key: 'all', labelKey: 'pantry.filter_all' },
  { key: 'new', labelKey: 'product.status.new' },
  { key: 'opened', labelKey: 'product.status.opened' },
  { key: 'almost_empty', labelKey: 'product.status.almost_empty' },
];

export function StatusFilterBar({ selectedStatus, onStatusChange }: StatusFilterBarProps) {
  const { t } = useTranslation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
      {FILTERS.map(({ key, labelKey }) => {
        const isSelected = selectedStatus === key;
        return (
          <Pressable
            key={key}
            onPress={() => onStatusChange(key)}
            className={cn(
              'mr-2 min-h-[48px] items-center justify-center rounded-full border px-4',
              isSelected ? 'border-neutral-800 bg-neutral-800' : 'border-neutral-300 bg-white'
            )}
          >
            <Text
              className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-neutral-600')}
            >
              {t(labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
