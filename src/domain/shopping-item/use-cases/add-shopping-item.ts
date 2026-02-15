import type { ShoppingItem } from '../model';

export interface AddShoppingItemUseCase {
  execute(name: string, productId?: string): Promise<ShoppingItem>;
}
