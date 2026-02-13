import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { Refrigerator, Snowflake, Warehouse } from 'lucide-react-native';

import type { ProductLocation } from '@domain/product/value-objects';

import { cn } from '~/core/utils/cn';

interface LocationPickerProps {
  value?: ProductLocation;
  onChange: (location: ProductLocation | undefined) => void;
}

const LOCATIONS: { key: ProductLocation; Icon: typeof Refrigerator }[] = [
  { key: 'fridge', Icon: Refrigerator },
  { key: 'pantry', Icon: Warehouse },
  { key: 'freezer', Icon: Snowflake },
];

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text className="text-sm text-neutral-500">{t('product_detail.location_label')}</Text>
      <View className="flex-row gap-3">
        {LOCATIONS.map(({ key, Icon }) => {
          const isSelected = value === key;
          return (
            <Pressable
              key={key}
              onPress={() => onChange(isSelected ? undefined : key)}
              className={cn(
                'min-h-[56px] flex-1 items-center justify-center rounded-xl py-4',
                isSelected ? 'bg-neutral-800' : 'bg-neutral-100'
              )}
            >
              <Icon size={24} color={isSelected ? '#ffffff' : '#525252'} />
              <Text
                className={cn(
                  'mt-1 text-xs',
                  isSelected ? 'font-medium text-white' : 'text-neutral-600'
                )}
              >
                {t(`product_detail.location_${key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
