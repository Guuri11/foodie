import { useCallback } from 'react';

import type { ProductLocation } from '@domain/product/value-objects';

import { useProductStore } from '~/lib/stores/product-store';

export function useProductDetail(productId: string) {
  const products = useProductStore((s) => s.products);
  const updateProduct = useProductStore((s) => s.updateProduct);

  const product = products.find((p) => p.id === productId) ?? null;

  const setLocation = useCallback(
    async (location: ProductLocation | undefined) => {
      await updateProduct(productId, { location });
    },
    [productId, updateProduct]
  );

  const setQuantity = useCallback(
    async (quantity: string) => {
      const trimmed = quantity.trim();
      await updateProduct(productId, { quantity: trimmed || undefined });
    },
    [productId, updateProduct]
  );

  return {
    product,
    setLocation,
    setQuantity,
  };
}
