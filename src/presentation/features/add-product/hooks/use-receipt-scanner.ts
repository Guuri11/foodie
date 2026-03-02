import { useCallback, useState } from 'react';

import type { ReceiptItem } from '@domain/product/services/receipt-scanner';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

export function useReceiptScanner() {
  const { scanReceipt, createPurchase } = useUseCases();
  const addProducts = useProductStore((s) => s.addProducts);

  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ReceiptItem[]>([]);
  const [scanError, setScanError] = useState<Error | null>(null);
  const [storeName, setStoreName] = useState<string | undefined>(undefined);
  const [totalAmount, setTotalAmount] = useState<number | undefined>(undefined);

  const captureAndScan = useCallback(
    async (imageBase64: string) => {
      setScanning(true);
      setScanError(null);

      try {
        const result = await scanReceipt.execute(imageBase64);
        setScannedItems(result.items);
        setStoreName(result.storeName);
        setTotalAmount(result.totalAmount);
      } catch (e) {
        setScanError(e instanceof Error ? e : new Error('Unknown scan error'));
      } finally {
        setScanning(false);
      }
    },
    [scanReceipt]
  );

  const removeItem = useCallback((index: number) => {
    setScannedItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const editItem = useCallback((index: number, newName: string) => {
    setScannedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
    );
  }, []);

  const editPrice = useCallback((index: number, price: number | undefined) => {
    setScannedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, price } : item))
    );
  }, []);

  const confirmItems = useCallback(async () => {
    const names = scannedItems.map((item) => item.name);

    await Promise.all([
      addProducts(names),
      createPurchase.execute({
        storeName,
        totalAmount,
        items: scannedItems.map((item) => ({
          productName: item.name,
          price: item.price,
        })),
      }),
    ]);

    setScannedItems([]);
    setStoreName(undefined);
    setTotalAmount(undefined);
  }, [scannedItems, storeName, totalAmount, addProducts, createPurchase]);

  const cancelReview = useCallback(() => {
    setScannedItems([]);
    setScanError(null);
    setStoreName(undefined);
    setTotalAmount(undefined);
  }, []);

  return {
    scanning,
    scannedItems,
    scanError,
    storeName,
    totalAmount,
    setStoreName,
    captureAndScan,
    removeItem,
    editItem,
    editPrice,
    confirmItems,
    cancelReview,
  };
}
