import { useCallback, useEffect, useRef } from 'react';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

export function useDashboard() {
  const useCases = useUseCases();
  const initialized = useRef(false);
  const products = useProductStore((s) => s.products);
  const totalCount = useProductStore((s) => s.totalCount);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const initialize = useProductStore((s) => s.initialize);
  const loadProducts = useProductStore((s) => s.loadProducts);
  const addProduct = useProductStore((s) => s.addProduct);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize(useCases);
    loadProducts();
  }, [initialize, useCases, loadProducts]);

  const handleAddProduct = useCallback(
    async (name: string) => {
      await addProduct(name);
    },
    [addProduct]
  );

  const hasActiveProducts = products.length > 0;
  const allFinished = !hasActiveProducts && totalCount > 0;

  return {
    products,
    loading,
    error,
    hasActiveProducts,
    allFinished,
    addProduct: handleAddProduct,
    refresh: loadProducts,
  };
}
