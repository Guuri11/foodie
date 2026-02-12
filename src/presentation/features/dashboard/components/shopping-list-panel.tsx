import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import { Card, CardContent, CardHeader, CardTitle } from '~/shared/ui/card';
import { Text } from '~/shared/ui/text';

export function ShoppingListPanel() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card className="flex-1">
      <CardHeader>
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => router.push('/shopping-list')}
        >
          <CardTitle>{t('dashboard.shopping_list.title')}</CardTitle>
          <ChevronRight size={20} className="text-muted-foreground" />
        </Pressable>
      </CardHeader>
      <CardContent className="flex-1 items-center justify-center">
        <Text variant="muted">{t('dashboard.shopping_list.empty')}</Text>
      </CardContent>
    </Card>
  );
}
