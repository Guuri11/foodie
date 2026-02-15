import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Share2 } from 'lucide-react-native';

import { Button } from '~/shared/ui/button';
import { Icon } from '~/shared/ui/icon';
import { Input } from '~/shared/ui/input';
import { Text } from '~/shared/ui/text';

import { ShoppingListView } from '../components/shopping-list-view';
import { useShareShoppingList } from '../hooks/use-share-shopping-list';
import { useShoppingList } from '../hooks/use-shopping-list';

export function ShoppingListScreen() {
  const { t } = useTranslation();
  const {
    pendingItems,
    boughtItems,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    clearBought,
  } = useShoppingList();
  const { shareList } = useShareShoppingList(pendingItems);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(async () => {
    const name = inputValue.trim();
    if (!name) return;
    setInputValue('');
    await addItem(name);
  }, [inputValue, addItem]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text variant="muted">{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text variant="h3">{t('shopping_list.title')}</Text>
        {pendingItems.length > 0 && (
          <Pressable onPress={shareList} hitSlop={8}>
            <Icon as={Share2} size={20} className="text-muted-foreground" />
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center gap-2 px-4 pb-4">
        <Input
          className="flex-1"
          placeholder={t('shopping_list.input_placeholder')}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Button onPress={handleAdd} disabled={!inputValue.trim()}>
          <Text>{t('common.add')}</Text>
        </Button>
      </View>

      <ShoppingListView
        pendingItems={pendingItems}
        boughtItems={boughtItems}
        onToggle={toggleItem}
        onDelete={deleteItem}
      />

      {boughtItems.length > 0 && (
        <View className="border-t border-border px-4 py-3">
          <Button variant="outline" onPress={clearBought}>
            <Text>{t('shopping_list.clear_bought')}</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
