import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { COMMON_PRODUCT_NAMES } from '@infrastructure/services/product/common-product-names';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

export function useAddProduct() {
  const useCases = useUseCases();
  const initialized = useRef(false);

  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const initialize = useProductStore((s) => s.initialize);
  const storeAddProduct = useProductStore((s) => s.addProduct);

  const [input, setInput] = useState('');
  const [addError, setAddError] = useState<Error | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize(useCases);
  }, [initialize, useCases]);

  const suggestions = useMemo(() => {
    if (!input.trim()) return [];

    const query = input.toLowerCase();

    const historyNames = products.map((p) => p.name);
    const allNames = [...COMMON_PRODUCT_NAMES, ...historyNames];

    const seen = new Set<string>();
    const result: string[] = [];

    for (const name of allNames) {
      const lower = name.toLowerCase();
      if (lower.includes(query) && !seen.has(lower)) {
        seen.add(lower);
        result.push(name);
      }
    }

    return result;
  }, [input, products]);

  const addProduct = useCallback(
    async (name?: string) => {
      const productName = (name ?? input).trim();
      if (!productName) return;

      setAddError(null);
      try {
        await storeAddProduct(productName);
        setInput('');
      } catch (e) {
        setAddError(e instanceof Error ? e : new Error('Unknown error'));
      }
    },
    [input, storeAddProduct]
  );

  return {
    input,
    setInput,
    suggestions,
    addProduct,
    loading,
    error: addError ?? error,
  };
}
