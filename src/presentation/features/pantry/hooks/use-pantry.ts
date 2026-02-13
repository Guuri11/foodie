import { useMemo, useState } from 'react';

import { sortByUrgency } from '@domain/product/model';
import type { ProductStatus } from '@domain/product/value-objects';

import { useProductStore } from '~/lib/stores/product-store';

export function usePantry() {
  const products = useProductStore((s) => s.products);
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | 'all'>('all');

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
