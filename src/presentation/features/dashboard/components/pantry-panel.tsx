import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import type { Product } from '@domain/product/model';

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

export function PantryPanel({ products }: PantryPanelProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const visibleProducts = products.slice(0, MAX_VISIBLE_PRODUCTS);

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
        {visibleProducts.map((product) => (
          <View key={product.id} className="flex-row items-center justify-between py-1">
            <Text>{product.name}</Text>
            <Badge variant={statusToBadgeVariant(product.status)}>
              <Text>{t(`product.status.${product.status}`)}</Text>
            </Badge>
          </View>
        ))}
      </CardContent>
    </Card>
  );
}
