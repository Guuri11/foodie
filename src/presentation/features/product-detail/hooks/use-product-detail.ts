import { useCallback, useMemo, useState } from 'react';

import type { UrgencyInfo } from '@domain/product/urgency-messages';
import { getUrgencyInfo } from '@domain/product/urgency-messages';
import type { ProductLocation, ProductOutcome, ProductStatus } from '@domain/product/value-objects';

import { useProductStore } from '~/lib/stores/product-store';

const OK_URGENCY: UrgencyInfo = { level: 'ok', messageKey: 'product.urgency.ok' };

export function useProductDetail(productId: string) {
  const products = useProductStore((s) => s.products);
  const updateProduct = useProductStore((s) => s.updateProduct);

  const product = products.find((p) => p.id === productId) ?? null;

  const [showOutcomePrompt, setShowOutcomePrompt] = useState(false);

  const urgencyInfo = useMemo<UrgencyInfo>(() => {
    if (!product) return OK_URGENCY;
    return getUrgencyInfo(product);
  }, [product]);

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

  const setStatus = useCallback(
    async (status: ProductStatus) => {
      if (status === 'finished') {
        setShowOutcomePrompt(true);
        return;
      }
      await updateProduct(productId, { status });
    },
    [productId, updateProduct]
  );

  const setExpiryDate = useCallback(
    async (date: Date | undefined) => {
      await updateProduct(productId, { expiryDate: date ?? null });
    },
    [productId, updateProduct]
  );

  const finishWithOutcome = useCallback(
    async (outcome: ProductOutcome) => {
      setShowOutcomePrompt(false);
      await updateProduct(productId, { status: 'finished', outcome });
    },
    [productId, updateProduct]
  );

  const dismissOutcomePrompt = useCallback(() => {
    setShowOutcomePrompt(false);
  }, []);

  return {
    product,
    setLocation,
    setQuantity,
    setStatus,
    setExpiryDate,
    urgencyInfo,
    showOutcomePrompt,
    finishWithOutcome,
    dismissOutcomePrompt,
  };
}
