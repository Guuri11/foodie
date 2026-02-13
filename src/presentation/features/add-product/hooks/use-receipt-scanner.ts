import { useCallback, useState } from 'react';

import type { ReceiptItem } from '@domain/product/services/receipt-scanner';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

export function useReceiptScanner() {
  const { scanReceipt } = useUseCases();
  const addProducts = useProductStore((s) => s.addProducts);

  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ReceiptItem[]>([]);
  const [scanError, setScanError] = useState<Error | null>(null);

  const captureAndScan = useCallback(
    async (imageBase64: string) => {
      setScanning(true);
      setScanError(null);

      try {
        const result = await scanReceipt.execute(imageBase64);
        setScannedItems(result.items);
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

  const confirmItems = useCallback(async () => {
    const names = scannedItems.map((item) => item.name);
    await addProducts(names);
    setScannedItems([]);
  }, [scannedItems, addProducts]);

  const cancelReview = useCallback(() => {
    setScannedItems([]);
    setScanError(null);
  }, []);

  return {
    scanning,
    scannedItems,
    scanError,
    captureAndScan,
    removeItem,
    editItem,
    confirmItems,
    cancelReview,
  };
}
