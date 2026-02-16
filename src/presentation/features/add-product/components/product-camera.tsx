import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { type BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, Receipt, X } from 'lucide-react-native';

import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

interface ProductCameraProps {
  onBarcodeScanned: (barcode: string) => void;
  onCapture: (base64: string) => void;
  onClose: () => void;
  onSwitchToReceipt: () => void;
}

export function ProductCamera({
  onBarcodeScanned,
  onCapture,
  onClose,
  onSwitchToReceipt,
}: ProductCameraProps) {
  const { t } = useTranslation();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const lastScannedRef = useRef<string | null>(null);
  const [barcodeCooldown, setBarcodeCooldown] = useState(false);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (barcodeCooldown) return;
      if (result.data === lastScannedRef.current) return;

      lastScannedRef.current = result.data;
      setBarcodeCooldown(true);
      onBarcodeScanned(result.data);

      setTimeout(() => {
        setBarcodeCooldown(false);
      }, 3000);
    },
    [barcodeCooldown, onBarcodeScanned]
  );

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      base64: true,
      quality: 0.7,
    });

    if (photo?.base64) {
      onCapture(photo.base64);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Camera size={48} className="mb-4 text-muted-foreground" />
        <Text className="mb-6 text-center text-muted-foreground">
          {t('add_product.camera_permission')}
        </Text>
        <Button onPress={requestPermission}>
          <Text>{t('common.add')}</Text>
        </Button>
        <Button variant="ghost" className="mt-3" onPress={onClose}>
          <Text>{t('add_product.close')}</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <View className="absolute left-4 top-4 z-10">
        <Button variant="ghost" size="icon" onPress={onClose}>
          <X size={24} color="white" />
        </Button>
      </View>

      <View className="absolute left-0 right-0 top-16 items-center">
        <Text className="text-center text-sm text-white/80">
          {t('add_product.product_scan_hint')}
        </Text>
      </View>

      <View className="absolute bottom-8 left-0 right-0 items-center gap-4">
        <Pressable
          className="h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-white/30 active:bg-white/50"
          onPress={handleCapture}
          accessibilityLabel={t('add_product.scan_button')}
        >
          <View className="h-[56px] w-[56px] rounded-full bg-white" />
        </Pressable>

        <Pressable
          className="flex-row items-center gap-2 rounded-full bg-black/40 px-4 py-2 active:bg-black/60"
          onPress={onSwitchToReceipt}
        >
          <Receipt size={16} color="white" />
          <Text className="text-sm text-white">{t('add_product.switch_to_receipt')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
