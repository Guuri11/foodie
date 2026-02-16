import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';

import type { ShoppingItem } from '@domain/shopping-item/model';

export function useShareShoppingList(pendingItems: ShoppingItem[]) {
  const { t } = useTranslation();

  const shareList = useCallback(async () => {
    if (pendingItems.length === 0) return;

    const lines = pendingItems.map((item) => `- ${item.name}`);
    const text = `${t('shopping_list.share_title')}\n${lines.join('\n')}`;

    await Share.share({ message: text });
  }, [pendingItems, t]);

  return { shareList };
}
