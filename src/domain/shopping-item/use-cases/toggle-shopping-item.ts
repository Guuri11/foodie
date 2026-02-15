import type { ShoppingItem } from '../model';

export interface ToggleShoppingItemUseCase {
  execute(id: string, isBought: boolean): Promise<ShoppingItem>;
}
