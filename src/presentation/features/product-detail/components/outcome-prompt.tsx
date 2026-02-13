import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';

import type { ProductOutcome } from '@domain/product/value-objects';

interface OutcomePromptProps {
  visible: boolean;
  onSelect: (outcome: ProductOutcome) => void;
  onDismiss: () => void;
}

export function OutcomePrompt({ visible, onSelect, onDismiss }: OutcomePromptProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={onDismiss}>
        <Pressable
          className="mx-6 w-full max-w-sm rounded-2xl bg-white p-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="mb-6 text-center text-xl font-semibold text-neutral-800">
            {t('product_detail.outcome_title')}
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => onSelect('used')}
              className="min-h-[72px] flex-1 items-center justify-center rounded-xl bg-neutral-100 py-4"
            >
              <Check size={24} color="#525252" />
              <Text className="mt-1 text-sm font-medium text-neutral-700">
                {t('product_detail.outcome_used')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onSelect('thrown_away')}
              className="min-h-[72px] flex-1 items-center justify-center rounded-xl bg-neutral-100 py-4"
            >
              <Trash2 size={24} color="#525252" />
              <Text className="mt-1 text-sm font-medium text-neutral-700">
                {t('product_detail.outcome_thrown')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
