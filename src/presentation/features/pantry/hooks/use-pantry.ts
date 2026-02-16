import { useEffect, useMemo, useRef, useState } from 'react';

import { sortByUrgency } from '@domain/product/model';
import type { ProductStatus } from '@domain/product/value-objects';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

export function usePantry() {
  const useCases = useUseCases();
  const initialized = useRef(false);
  const products = useProductStore((s) => s.products);
  const initialize = useProductStore((s) => s.initialize);
  const loadProducts = useProductStore((s) => s.loadProducts);
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | 'all'>('all');

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize(useCases);
    loadProducts();
  }, [initialize, useCases, loadProducts]);

  const filteredProducts = useMemo(() => {
    const filtered =
      selectedStatus === 'all' ? products : products.filter((p) => p.status === selectedStatus);
    return sortByUrgency(filtered);
  }, [products, selectedStatus]);

  return {
    products: filteredProducts,
    selectedStatus,
    setSelectedStatus,
  };
}
