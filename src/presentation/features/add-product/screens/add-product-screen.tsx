import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '~/shared/ui/text';

import { AddProductForm } from '../components/add-product-form';
import { CameraCapture } from '../components/camera-capture';
import { ReceiptReviewList } from '../components/receipt-review-list';
import { useAddProduct } from '../hooks/use-add-product';
import { useReceiptScanner } from '../hooks/use-receipt-scanner';

type Mode = 'text' | 'camera' | 'review';

export function AddProductScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('text');

  const { input, setInput, suggestions, addProduct, loading, error } = useAddProduct();

  const {
    scanning,
    scannedItems,
    scanError,
    captureAndScan,
    removeItem,
    editItem,
    confirmItems,
    cancelReview,
  } = useReceiptScanner();

  const handleCapture = async (base64: string) => {
    await captureAndScan(base64);
    setMode('review');
  };

  const handleConfirm = async () => {
    await confirmItems();
    setMode('text');
  };

  const handleCancelReview = () => {
    cancelReview();
    setMode('text');
  };

  if (mode === 'camera') {
    return <CameraCapture onCapture={handleCapture} onClose={() => setMode('text')} />;
  }

  if (mode === 'review') {
    if (scanning) {
      return (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-muted-foreground">{t('add_product.scanning')}</Text>
        </View>
      );
    }

    if (scanError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-8">
          <Text className="mb-4 text-center text-muted-foreground">
            {t('add_product.scan_error')}
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <View className="rounded-lg border border-border bg-secondary px-4 py-3">
                <Text
                  className="text-center text-sm text-secondary-foreground"
                  onPress={() => setMode('camera')}
                >
                  {t('add_product.scan_button')}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <View className="rounded-lg border border-border bg-secondary px-4 py-3">
                <Text
                  className="text-center text-sm text-secondary-foreground"
                  onPress={handleCancelReview}
                >
                  {t('add_product.review_cancel')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <ReceiptReviewList
        items={scannedItems}
        loading={loading}
        onRemove={removeItem}
        onEdit={editItem}
        onConfirm={handleConfirm}
        onCancel={handleCancelReview}
      />
    );
  }

  return (
    <AddProductForm
      input={input}
      suggestions={suggestions}
      loading={loading}
      error={error}
      onInputChange={setInput}
      onAdd={addProduct}
      onClose={() => router.back()}
      onOpenCamera={() => setMode('camera')}
    />
  );
}
