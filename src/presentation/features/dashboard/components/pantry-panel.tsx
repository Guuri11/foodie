import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Refrigerator, Snowflake, Warehouse } from 'lucide-react-native';

import { type Product, sortByUrgency } from '@domain/product/model';
import type { ProductLocation } from '@domain/product/value-objects';

import { Badge } from '~/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/ui/card';
import { Text } from '~/shared/ui/text';

const MAX_VISIBLE_PRODUCTS = 5;

interface PantryPanelProps {
  products: Product[];
}

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

const LOCATION_ICONS: Record<ProductLocation, typeof Refrigerator> = {
  fridge: Refrigerator,
  pantry: Warehouse,
  freezer: Snowflake,
};

export function PantryPanel({ products }: PantryPanelProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const visibleProducts = sortByUrgency(products).slice(0, MAX_VISIBLE_PRODUCTS);

  return (
    <Card className="flex-1">
      <CardHeader>
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => router.push('/pantry')}
        >
          <CardTitle>{t('dashboard.pantry.title')}</CardTitle>
          <ChevronRight size={20} className="text-muted-foreground" />
        </Pressable>
      </CardHeader>
      <CardContent className="flex-1 gap-2">
        {visibleProducts.map((product) => {
          const LocationIcon = product.location ? LOCATION_ICONS[product.location] : null;
          return (
            <Pressable
              key={product.id}
              className="flex-row items-center justify-between py-1"
              onPress={() => router.push(`/modal/product/${product.id}`)}
            >
              <View className="flex-1 flex-row items-center gap-2">
                {LocationIcon && <LocationIcon size={14} color="#a3a3a3" />}
                <Text>{product.name}</Text>
                {product.quantity && (
                  <Text className="text-xs text-muted-foreground">{product.quantity}</Text>
                )}
              </View>
              <Badge variant={statusToBadgeVariant(product.status)}>
                <Text>{t(`product.status.${product.status}`)}</Text>
              </Badge>
            </Pressable>
          );
        })}
      </CardContent>
    </Card>
  );
}
