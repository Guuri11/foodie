import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Refrigerator, Snowflake, Warehouse } from 'lucide-react-native';

import type { Product } from '@domain/product/model';
import { getUrgencyInfo } from '@domain/product/urgency-messages';
import type { ProductLocation } from '@domain/product/value-objects';

import { Badge } from '~/shared/ui/badge';

const LOCATION_ICONS: Record<ProductLocation, typeof Refrigerator> = {
  fridge: Refrigerator,
  pantry: Warehouse,
  freezer: Snowflake,
};

function statusToBadgeVariant(status: Product['status']) {
  switch (status) {
    case 'new':
      return 'secondary';
    case 'opened':
      return 'default';
    case 'almost_empty':
      return 'destructive';
    default:
      return 'outline';
  }
}

interface PantryListProps {
  products: Product[];
  emptyMessage: string;
}

export function PantryList({ products, emptyMessage }: PantryListProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-neutral-400">{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      contentContainerClassName="px-4 py-2"
      renderItem={({ item }) => {
        const LocationIcon = item.location ? LOCATION_ICONS[item.location] : null;
        const urgency = getUrgencyInfo(item);
        return (
          <Pressable
            className="flex-row items-center justify-between border-b border-neutral-100 py-3"
            onPress={() => router.push(`/modal/product/${item.id}`)}
          >
            <View className="flex-1 gap-0.5">
              <View className="flex-row items-center gap-2">
                {LocationIcon && <LocationIcon size={14} color="#a3a3a3" />}
                <Text className="text-base text-neutral-800">{item.name}</Text>
                {item.quantity && <Text className="text-xs text-neutral-400">{item.quantity}</Text>}
              </View>
              {urgency.level !== 'ok' && (
                <Text
                  className={`text-xs ${
                    urgency.level === 'wouldnt_trust'
                      ? 'text-red-600'
                      : urgency.level === 'use_today'
                        ? 'text-orange-600'
                        : 'text-amber-600'
                  }`}
                >
                  {t(urgency.messageKey)}
                </Text>
              )}
            </View>
            <Badge variant={statusToBadgeVariant(item.status)}>
              <Text className="text-xs">{t(`product.status.${item.status}`)}</Text>
            </Badge>
          </Pressable>
        );
      }}
    />
  );
}
