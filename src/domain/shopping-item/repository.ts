import type { ShoppingItem } from './model';

export interface ShoppingItemRepository {
  getAll(): Promise<ShoppingItem[]>;
  save(item: ShoppingItem): Promise<ShoppingItem>;
  update(id: string, changes: { name?: string; isBought?: boolean }): Promise<ShoppingItem>;
  delete(id: string): Promise<void>;
  clearBought(): Promise<number>;
}
