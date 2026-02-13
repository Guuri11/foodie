import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Camera } from 'lucide-react-native';

import { Button } from '~/shared/ui/button';
import { Input } from '~/shared/ui/input';
import { Text } from '~/shared/ui/text';

interface AddProductFormProps {
  input: string;
  suggestions: string[];
  loading: boolean;
  error: Error | null;
  onInputChange: (text: string) => void;
  onAdd: (name?: string) => Promise<void>;
  onClose: () => void;
  onOpenCamera: () => void;
}

export function AddProductForm({
  input,
  suggestions,
  loading,
  error,
  onInputChange,
  onAdd,
  onClose,
  onOpenCamera,
}: AddProductFormProps) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleAdd = async (name?: string) => {
    const productName = name ?? input;
    if (!productName.trim()) return;

    await onAdd(name);
    setFeedback(t('add_product.added_feedback'));
    inputRef.current?.focus();
  };

  const handleSuggestionTap = async (name: string) => {
    onInputChange(name);
    await handleAdd(name);
  };

  const canAdd = input.trim().length > 0 && !loading;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pb-4 pt-6">
        <Text variant="h3">{t('add_product.title')}</Text>
        <Button variant="ghost" onPress={onClose}>
          <Text>{t('add_product.close')}</Text>
        </Button>
      </View>

      <View className="flex-row items-center gap-3 px-6">
        <View className="min-h-[56px] flex-1 justify-center">
          <Input
            ref={inputRef}
            className="h-14 text-lg"
            placeholder={t('add_product.input_placeholder')}
            value={input}
            onChangeText={onInputChange}
            onSubmitEditing={() => handleAdd()}
            returnKeyType="done"
            autoCapitalize="sentences"
            autoCorrect={false}
          />
        </View>
        <Button className="h-14 px-6" disabled={!canAdd} onPress={() => handleAdd()}>
          <Text>{t('add_product.add_button')}</Text>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14"
          onPress={onOpenCamera}
          accessibilityLabel={t('add_product.scan_button')}
        >
          <Camera size={22} className="text-foreground" />
        </Button>
      </View>

      {feedback && (
        <View className="px-6 pt-3">
          <Text className="text-sm text-primary">{feedback}</Text>
        </View>
      )}

      {error && (
        <View className="px-6 pt-3">
          <Text className="text-sm text-destructive">{error.message}</Text>
        </View>
      )}

      {suggestions.length > 0 && (
        <ScrollView className="mt-4 flex-1 px-6" keyboardShouldPersistTaps="handled">
          <View className="flex-row flex-wrap gap-2">
            {suggestions.map((name) => (
              <Pressable
                key={name}
                className="rounded-full border border-border bg-secondary px-4 py-2 active:bg-accent"
                onPress={() => handleSuggestionTap(name)}
              >
                <Text className="text-sm text-secondary-foreground">{name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
