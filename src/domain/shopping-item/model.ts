import { ShoppingItemError } from './errors';

export interface ShoppingItem {
  id: string;
  name: string;
  productId?: string;
  isBought: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createShoppingItem(params: {
  id: string;
  name: string;
  productId?: string;
}): ShoppingItem {
  const trimmedName = params.name.trim();
  if (!trimmedName) {
    throw ShoppingItemError.nameEmpty();
  }

  const now = new Date();
  return {
    id: params.id,
    name: trimmedName,
    productId: params.productId,
    isBought: false,
    createdAt: now,
    updatedAt: now,
  };
}
