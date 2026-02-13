import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';

interface QuantityInputProps {
  value?: string;
  onChange: (quantity: string) => void;
}

export function QuantityInput({ value, onChange }: QuantityInputProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text className="text-sm text-neutral-500">{t('product_detail.quantity_label')}</Text>
      <TextInput
        className="rounded-xl bg-neutral-100 px-4 py-3 text-base text-neutral-800"
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={t('product_detail.quantity_placeholder')}
        placeholderTextColor="#a3a3a3"
        autoCapitalize="none"
        returnKeyType="done"
      />
    </View>
  );
}
