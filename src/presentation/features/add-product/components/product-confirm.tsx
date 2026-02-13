import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { AlertCircle, Barcode, Camera } from 'lucide-react-native';

import type { ProductIdentification } from '@domain/product/services/product-identifier';

import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

interface ProductConfirmProps {
  product: ProductIdentification;
  loading: boolean;
  onConfirm: () => void;
  onEdit: (name: string) => void;
  onCancel: () => void;
  onFallbackToText: () => void;
}

export function ProductConfirm({
  product,
  loading,
  onConfirm,
  onEdit,
  onCancel,
  onFallbackToText,
}: ProductConfirmProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  const MethodIcon = product.method === 'barcode' ? Barcode : Camera;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-3 flex-row items-center gap-2">
          <MethodIcon size={18} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">
            {t('add_product.product_identified')}
          </Text>
        </View>

        {editing ? (
          <TextInput
            className="w-full text-center text-2xl font-semibold text-foreground"
            defaultValue={product.name}
            autoFocus
            onEndEditing={(e) => {
              onEdit(e.nativeEvent.text);
              setEditing(false);
            }}
            onSubmitEditing={(e) => {
              onEdit(e.nativeEvent.text);
              setEditing(false);
            }}
            returnKeyType="done"
          />
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <Text className="text-center text-2xl font-semibold">{product.name}</Text>
          </Pressable>
        )}

        {product.confidence === 'low' && (
          <View className="mt-3 flex-row items-center gap-1">
            <AlertCircle size={14} className="text-warning" />
            <Text className="text-sm text-warning">{t('add_product.low_confidence')}</Text>
          </View>
        )}
      </View>

      <View className="gap-2 px-6 pb-6">
        <Button className="h-14" disabled={!product.name || loading} onPress={onConfirm}>
          <Text>{t('add_product.product_confirm')}</Text>
        </Button>
        <Button variant="outline" onPress={onCancel}>
          <Text>{t('add_product.product_scan_again')}</Text>
        </Button>
        <Button variant="ghost" onPress={onFallbackToText}>
          <Text className="text-muted-foreground">{t('add_product.product_write_manually')}</Text>
        </Button>
      </View>
    </View>
  );
}
