import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import { useUseCases } from '~/core/providers/use-case-provider';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/ui/card';
import { Checkbox } from '~/shared/ui/checkbox';
import { Text } from '~/shared/ui/text';

import { useShoppingListStore } from '~/lib/stores/shopping-list-store';

const MAX_PREVIEW_ITEMS = 4;

export function ShoppingListPanel() {
  const router = useRouter();
  const { t } = useTranslation();
  const useCases = useUseCases();
  const initialized = useRef(false);
  const items = useShoppingListStore((s) => s.items);
  const initialize = useShoppingListStore((s) => s.initialize);
  const loadItems = useShoppingListStore((s) => s.loadItems);
  const toggleItem = useShoppingListStore((s) => s.toggleItem);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize(useCases);
    loadItems();
  }, [initialize, useCases, loadItems]);

  const pendingItems = useMemo(() => items.filter((i) => !i.isBought), [items]);
  const previewItems = pendingItems.slice(0, MAX_PREVIEW_ITEMS);
  const remainingCount = pendingItems.length - previewItems.length;

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
      <CardContent className="flex-1">
        {pendingItems.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text variant="muted">{t('dashboard.shopping_list.empty')}</Text>
          </View>
        ) : (
          <View className="gap-1">
            {previewItems.map((item) => (
              <Pressable
                key={item.id}
                className="min-h-[44px] flex-row items-center gap-3"
                onPress={() => toggleItem(item.id, true)}
              >
                <Checkbox checked={false} onCheckedChange={() => toggleItem(item.id, true)} />
                <Text className="flex-1" numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            ))}
            {remainingCount > 0 && (
              <Pressable onPress={() => router.push('/shopping-list')}>
                <Text variant="muted" className="pl-7 pt-1">
                  {t('dashboard.shopping_list.more', { count: remainingCount })}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );
}
