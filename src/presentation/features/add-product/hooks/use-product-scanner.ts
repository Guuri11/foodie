import { useCallback, useState } from 'react';

import type { ProductIdentification } from '@domain/product/services/product-identifier';
import type { ProductLocation } from '@domain/product/value-objects';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

export function useProductScanner() {
  const { identifyProduct } = useUseCases();
  const addProduct = useProductStore((s) => s.addProduct);

  const [identifying, setIdentifying] = useState(false);
  const [identifiedProduct, setIdentifiedProduct] = useState<ProductIdentification | null>(null);
  const [scanError, setScanError] = useState<Error | null>(null);

  const identifyByImage = useCallback(
    async (imageBase64: string) => {
      setIdentifying(true);
      setScanError(null);

      try {
        const result = await identifyProduct.executeByImage(imageBase64);
        setIdentifiedProduct(result);
      } catch (e) {
        setScanError(e instanceof Error ? e : new Error('Unknown identification error'));
      } finally {
        setIdentifying(false);
      }
    },
    [identifyProduct]
  );

  const identifyByBarcode = useCallback(
    async (barcode: string) => {
      setIdentifying(true);
      setScanError(null);

      try {
        const result = await identifyProduct.executeByBarcode(barcode);
        setIdentifiedProduct(result);
      } catch (e) {
        setScanError(e instanceof Error ? e : new Error('Unknown identification error'));
      } finally {
        setIdentifying(false);
      }
    },
    [identifyProduct]
  );

  const editProductName = useCallback((name: string) => {
    setIdentifiedProduct((prev) => (prev ? { ...prev, name } : null));
  }, []);

  const confirmProduct = useCallback(async () => {
    if (!identifiedProduct) return;
    await addProduct(identifiedProduct.name);
    setIdentifiedProduct(null);
  }, [identifiedProduct, addProduct]);

  const confirmWithExtras = useCallback(
    async (location?: ProductLocation, quantity?: string) => {
      if (!identifiedProduct) return;
      await addProduct(identifiedProduct.name, { location, quantity });
      setIdentifiedProduct(null);
    },
    [identifiedProduct, addProduct]
  );

  const skipExtras = useCallback(async () => {
    if (!identifiedProduct) return;
    await addProduct(identifiedProduct.name);
    setIdentifiedProduct(null);
  }, [identifiedProduct, addProduct]);

  const cancelIdentification = useCallback(() => {
    setIdentifiedProduct(null);
    setScanError(null);
  }, []);

  const reset = useCallback(() => {
    setIdentifying(false);
    setIdentifiedProduct(null);
    setScanError(null);
  }, []);

  return {
    identifying,
    identifiedProduct,
    scanError,
    identifyByImage,
    identifyByBarcode,
    editProductName,
    confirmProduct,
    confirmWithExtras,
    skipExtras,
    cancelIdentification,
    reset,
  };
}
