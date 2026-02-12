import { useCallback, useEffect } from 'react';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

export function useDashboard() {
  const useCases = useUseCases();
  const { products, loading, error, loadProducts, addProduct, hasActiveProducts, initialize } =
    useProductStore();

  useEffect(() => {
    initialize(useCases);
    loadProducts();
  }, [initialize, useCases, loadProducts]);

  const handleAddProduct = useCallback(
    async (name: string) => {
      await addProduct(name);
    },
    [addProduct]
  );

  return {
    products,
    loading,
    error,
    hasActiveProducts: hasActiveProducts(),
    addProduct: handleAddProduct,
    refresh: loadProducts,
  };
}
