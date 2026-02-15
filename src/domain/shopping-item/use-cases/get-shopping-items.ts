import type { ShoppingItem } from '../model';

export interface GetShoppingItemsUseCase {
  execute(): Promise<ShoppingItem[]>;
}
