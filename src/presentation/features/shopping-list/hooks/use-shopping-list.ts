import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useUseCases } from '~/core/providers/use-case-provider';
import { useShoppingListStore } from '~/lib/stores/shopping-list-store';

export function useShoppingList() {
  const useCases = useUseCases();
  const initialized = useRef(false);
  const items = useShoppingListStore((s) => s.items);
  const loading = useShoppingListStore((s) => s.loading);
  const error = useShoppingListStore((s) => s.error);
  const initialize = useShoppingListStore((s) => s.initialize);
  const loadItems = useShoppingListStore((s) => s.loadItems);
  const storeAddItem = useShoppingListStore((s) => s.addItem);
  const storeToggleItem = useShoppingListStore((s) => s.toggleItem);
  const storeDeleteItem = useShoppingListStore((s) => s.deleteItem);
  const storeClearBought = useShoppingListStore((s) => s.clearBought);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize(useCases);
    loadItems();
  }, [initialize, useCases, loadItems]);

  const pendingItems = useMemo(() => items.filter((i) => !i.isBought), [items]);
  const boughtItems = useMemo(() => items.filter((i) => i.isBought), [items]);

  const addItem = useCallback(
    async (name: string) => {
      await storeAddItem(name);
    },
    [storeAddItem]
  );

  const toggleItem = useCallback(
    async (id: string, isBought: boolean) => {
      await storeToggleItem(id, isBought);
    },
    [storeToggleItem]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await storeDeleteItem(id);
    },
    [storeDeleteItem]
  );

  const clearBought = useCallback(async () => {
    await storeClearBought();
  }, [storeClearBought]);

  return {
    pendingItems,
    boughtItems,
    loading,
    error,
    addItem,
    toggleItem,
    deleteItem,
    clearBought,
    refresh: loadItems,
  };
}
