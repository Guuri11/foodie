import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X } from 'lucide-react-native';

interface ExpiryDatePickerProps {
  expiryDate?: Date;
  estimatedExpiryDate?: Date;
  onChange: (date: Date | undefined) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ExpiryDatePicker({
  expiryDate,
  estimatedExpiryDate,
  onChange,
}: ExpiryDatePickerProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  const displayDate = expiryDate ?? estimatedExpiryDate;
  const isEstimated = !expiryDate && !!estimatedExpiryDate;

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <View className="gap-2">
      <Text className="text-sm text-neutral-500">{t('product_detail.expiry_label')}</Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => setShowPicker(true)}
          className="min-h-[56px] flex-1 justify-center rounded-xl bg-neutral-100 px-4 py-3"
        >
          {displayDate ? (
            <Text
              className={isEstimated ? 'text-base text-neutral-400' : 'text-base text-neutral-800'}
            >
              {isEstimated && `${t('product_detail.expiry_estimated_prefix')} `}
              {formatDate(displayDate)}
            </Text>
          ) : (
            <Text className="text-base text-neutral-400">{t('product_detail.expiry_none')}</Text>
          )}
        </Pressable>
        {expiryDate && (
          <Pressable
            onPress={handleClear}
            className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
            accessibilityLabel={t('product_detail.expiry_clear')}
          >
            <X size={18} color="#737373" />
          </Pressable>
        )}
      </View>
      {showPicker && (
        <DateTimePicker
          value={displayDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}
