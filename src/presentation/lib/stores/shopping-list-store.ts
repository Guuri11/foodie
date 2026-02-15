import { create } from 'zustand';

import type { ShoppingItem } from '@domain/shopping-item/model';
import type { AddShoppingItemUseCase } from '@domain/shopping-item/use-cases/add-shopping-item';
import type { ClearBoughtItemsUseCase } from '@domain/shopping-item/use-cases/clear-bought-items';
import type { DeleteShoppingItemUseCase } from '@domain/shopping-item/use-cases/delete-shopping-item';
import type { GetShoppingItemsUseCase } from '@domain/shopping-item/use-cases/get-shopping-items';
import type { ToggleShoppingItemUseCase } from '@domain/shopping-item/use-cases/toggle-shopping-item';

interface ShoppingListState {
  items: ShoppingItem[];
  loading: boolean;
  error: Error | null;
}

interface ShoppingListActions {
  loadItems: () => Promise<void>;
  addItem: (name: string, productId?: string) => Promise<void>;
  toggleItem: (id: string, isBought: boolean) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearBought: () => Promise<number>;
  initialize: (useCases: {
    getShoppingItems: GetShoppingItemsUseCase;
    addShoppingItem: AddShoppingItemUseCase;
    toggleShoppingItem: ToggleShoppingItemUseCase;
    deleteShoppingItem: DeleteShoppingItemUseCase;
    clearBoughtItems: ClearBoughtItemsUseCase;
  }) => void;
}

type ShoppingListStore = ShoppingListState & ShoppingListActions;

let _getShoppingItems: GetShoppingItemsUseCase | null = null;
let _addShoppingItem: AddShoppingItemUseCase | null = null;
let _toggleShoppingItem: ToggleShoppingItemUseCase | null = null;
let _deleteShoppingItem: DeleteShoppingItemUseCase | null = null;
let _clearBoughtItems: ClearBoughtItemsUseCase | null = null;

export const useShoppingListStore = create<ShoppingListStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  initialize: (useCases) => {
    _getShoppingItems = useCases.getShoppingItems;
    _addShoppingItem = useCases.addShoppingItem;
    _toggleShoppingItem = useCases.toggleShoppingItem;
    _deleteShoppingItem = useCases.deleteShoppingItem;
    _clearBoughtItems = useCases.clearBoughtItems;
  },

  loadItems: async () => {
    if (!_getShoppingItems) return;
    set({ loading: true, error: null });
    try {
      const items = await _getShoppingItems.execute();
      set({ items, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error'), loading: false });
    }
  },

  addItem: async (name: string, productId?: string) => {
    if (!_addShoppingItem) return;
    set({ error: null });
    try {
      await _addShoppingItem.execute(name, productId);
      await get().loadItems();
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error') });
      throw e;
    }
  },

  toggleItem: async (id: string, isBought: boolean) => {
    if (!_toggleShoppingItem) return;
    set({ error: null });
    try {
      await _toggleShoppingItem.execute(id, isBought);
      await get().loadItems();
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error') });
    }
  },

  deleteItem: async (id: string) => {
    if (!_deleteShoppingItem) return;
    set({ error: null });
    try {
      await _deleteShoppingItem.execute(id);
      await get().loadItems();
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error') });
    }
  },

  clearBought: async () => {
    if (!_clearBoughtItems) return 0;
    set({ error: null });
    try {
      const count = await _clearBoughtItems.execute();
      await get().loadItems();
      return count;
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error') });
      return 0;
    }
  },
}));
