import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { SafeScreen } from '~/shared/components/safe-screen';
import { Text } from '~/shared/ui/text';

import { AddProductForm } from '../components/add-product-form';
import { CameraCapture } from '../components/camera-capture';
import { ProductCamera } from '../components/product-camera';
import { ProductConfirm } from '../components/product-confirm';
import { ProductExtrasStep } from '../components/product-extras-step';
import { ReceiptReviewList } from '../components/receipt-review-list';
import { useAddProduct } from '../hooks/use-add-product';
import { useProductScanner } from '../hooks/use-product-scanner';
import { useReceiptScanner } from '../hooks/use-receipt-scanner';

type Mode = 'text' | 'camera' | 'review' | 'product-camera' | 'product-confirm' | 'product-extras';

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

  const {
    identifying,
    identifiedProduct,
    scanError: productScanError,
    identifyByImage,
    identifyByBarcode,
    editProductName,
    confirmProduct,
    confirmWithExtras,
    skipExtras,
    cancelIdentification,
    reset: resetProductScanner,
  } = useProductScanner();

  const handleReceiptCapture = async (base64: string) => {
    await captureAndScan(base64);
    setMode('review');
  };

  const handleReceiptConfirm = async () => {
    await confirmItems();
    setMode('text');
  };

  const handleCancelReview = () => {
    cancelReview();
    setMode('text');
  };

  const handleProductBarcodeScanned = async (barcode: string) => {
    await identifyByBarcode(barcode);
    setMode('product-confirm');
  };

  const handleProductCapture = async (base64: string) => {
    await identifyByImage(base64);
    setMode('product-confirm');
  };

  const handleProductConfirm = async () => {
    if (identifiedProduct?.suggestedLocation || identifiedProduct?.suggestedQuantity) {
      setMode('product-extras');
      return;
    }
    await confirmProduct();
    setMode('text');
  };

  const handleExtrasConfirm = async (
    location?: import('@domain/product/value-objects').ProductLocation,
    quantity?: string
  ) => {
    await confirmWithExtras(location, quantity);
    setMode('text');
  };

  const handleExtrasSkip = async () => {
    await skipExtras();
    setMode('text');
  };

  const handleProductCancel = () => {
    cancelIdentification();
    setMode('product-camera');
  };

  const handleProductFallbackToText = () => {
    resetProductScanner();
    setMode('text');
  };

  if (mode === 'product-extras' && identifiedProduct) {
    return (
      <SafeScreen>
        <ProductExtrasStep
          productName={identifiedProduct.name}
          suggestedLocation={identifiedProduct.suggestedLocation}
          suggestedQuantity={identifiedProduct.suggestedQuantity}
          onConfirm={handleExtrasConfirm}
          onSkip={handleExtrasSkip}
        />
      </SafeScreen>
    );
  }

  if (mode === 'product-camera') {
    return (
      <ProductCamera
        onBarcodeScanned={handleProductBarcodeScanned}
        onCapture={handleProductCapture}
        onClose={() => {
          resetProductScanner();
          setMode('text');
        }}
        onSwitchToReceipt={() => setMode('camera')}
      />
    );
  }

  if (mode === 'product-confirm') {
    if (identifying) {
      return (
        <SafeScreen className="items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-muted-foreground">{t('add_product.identifying')}</Text>
        </SafeScreen>
      );
    }

    if (productScanError) {
      return (
        <SafeScreen className="items-center justify-center px-8">
          <Text className="mb-4 text-center text-muted-foreground">
            {t('add_product.product_not_recognized')}
          </Text>
          <View className="w-full gap-2">
            <View className="rounded-lg border border-border bg-secondary px-4 py-3">
              <Text
                className="text-center text-sm text-secondary-foreground"
                onPress={() => {
                  resetProductScanner();
                  setMode('product-camera');
                }}
              >
                {t('add_product.product_scan_again')}
              </Text>
            </View>
            <View className="rounded-lg border border-border bg-secondary px-4 py-3">
              <Text
                className="text-center text-sm text-secondary-foreground"
                onPress={handleProductFallbackToText}
              >
                {t('add_product.product_write_manually')}
              </Text>
            </View>
          </View>
        </SafeScreen>
      );
    }

    if (identifiedProduct) {
      return (
        <SafeScreen>
          <ProductConfirm
            product={identifiedProduct}
            loading={loading}
            onConfirm={handleProductConfirm}
            onEdit={editProductName}
            onCancel={handleProductCancel}
            onFallbackToText={handleProductFallbackToText}
          />
        </SafeScreen>
      );
    }
  }

  if (mode === 'camera') {
    return <CameraCapture onCapture={handleReceiptCapture} onClose={() => setMode('text')} />;
  }

  if (mode === 'review') {
    if (scanning) {
      return (
        <SafeScreen className="items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-muted-foreground">{t('add_product.scanning')}</Text>
        </SafeScreen>
      );
    }

    if (scanError) {
      return (
        <SafeScreen className="items-center justify-center px-8">
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
        </SafeScreen>
      );
    }

    return (
      <SafeScreen>
        <ReceiptReviewList
          items={scannedItems}
          loading={loading}
          onRemove={removeItem}
          onEdit={editItem}
          onConfirm={handleReceiptConfirm}
          onCancel={handleCancelReview}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <AddProductForm
        input={input}
        suggestions={suggestions}
        loading={loading}
        error={error}
        onInputChange={setInput}
        onAdd={addProduct}
        onClose={() => router.back()}
        onOpenCamera={() => setMode('product-camera')}
      />
    </SafeScreen>
  );
}
