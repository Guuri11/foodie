import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { AlertCircle, Trash2 } from 'lucide-react-native';

import type { ReceiptItem } from '@domain/product/services/receipt-scanner';

import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

interface ReceiptReviewListProps {
  items: ReceiptItem[];
  loading: boolean;
  onRemove: (index: number) => void;
  onEdit: (index: number, name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReceiptReviewList({
  items,
  loading,
  onRemove,
  onEdit,
  onConfirm,
  onCancel,
}: ReceiptReviewListProps) {
  const { t } = useTranslation();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-4 pt-6">
        <Text variant="h3">{t('add_product.review_title')}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {t('add_product.review_count', { count: items.length })}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {items.map((item, index) => (
          <View
            key={`${item.name}-${index}`}
            className="mb-2 flex-row items-center rounded-lg border border-border bg-card px-4 py-3"
          >
            {editingIndex === index ? (
              <TextInput
                className="flex-1 text-base text-foreground"
                defaultValue={item.name}
                autoFocus
                onEndEditing={(e) => {
                  onEdit(index, e.nativeEvent.text);
                  setEditingIndex(null);
                }}
                onSubmitEditing={(e) => {
                  onEdit(index, e.nativeEvent.text);
                  setEditingIndex(null);
                }}
                returnKeyType="done"
              />
            ) : (
              <Pressable className="flex-1" onPress={() => setEditingIndex(index)}>
                <Text className="text-base">{item.name}</Text>
                {item.confidence === 'low' && (
                  <View className="mt-1 flex-row items-center gap-1">
                    <AlertCircle size={12} className="text-warning" />
                    <Text className="text-xs text-warning">{t('add_product.low_confidence')}</Text>
                  </View>
                )}
              </Pressable>
            )}

            <Pressable
              className="ml-3 p-2 active:opacity-60"
              onPress={() => onRemove(index)}
              accessibilityLabel="Remove"
            >
              <Trash2 size={18} className="text-muted-foreground" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View className="gap-2 px-6 pb-6 pt-3">
        <Button className="h-14" disabled={items.length === 0 || loading} onPress={onConfirm}>
          <Text>{t('add_product.review_confirm')}</Text>
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          <Text>{t('add_product.review_cancel')}</Text>
        </Button>
      </View>
    </View>
  );
}
