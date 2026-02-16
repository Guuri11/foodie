import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import type { ShoppingItem } from '@domain/shopping-item/model';

import { Checkbox } from '~/shared/ui/checkbox';
import { Icon } from '~/shared/ui/icon';
import { Text } from '~/shared/ui/text';

interface ShoppingListViewProps {
  pendingItems: ShoppingItem[];
  boughtItems: ShoppingItem[];
  onToggle: (id: string, isBought: boolean) => void;
  onDelete: (id: string) => void;
}

export function ShoppingListView({
  pendingItems,
  boughtItems,
  onToggle,
  onDelete,
}: ShoppingListViewProps) {
  const { t } = useTranslation();

  if (pendingItems.length === 0 && boughtItems.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text variant="muted">{t('shopping_list.empty')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      {pendingItems.map((item) => (
        <ShoppingItemRow
          key={item.id}
          item={item}
          onToggle={() => onToggle(item.id, true)}
          onDelete={() => onDelete(item.id)}
        />
      ))}

      {boughtItems.length > 0 && (
        <>
          <View className="px-4 pb-2 pt-6">
            <Text variant="muted" className="text-xs uppercase tracking-wide">
              {t('shopping_list.bought_section')}
            </Text>
          </View>
          {boughtItems.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id, false)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable className="min-h-[44px] flex-1 flex-row items-center gap-3" onPress={onToggle}>
        <Checkbox checked={item.isBought} onCheckedChange={onToggle} />
        <Text className={item.isBought ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>
          {item.name}
        </Text>
      </Pressable>
      <Pressable
        className="min-h-[44px] min-w-[44px] items-center justify-center"
        onPress={onDelete}
        hitSlop={8}
      >
        <Icon as={Trash2} size={18} className="text-muted-foreground" />
      </Pressable>
    </View>
  );
}
