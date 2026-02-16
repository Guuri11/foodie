/**
 * SuggestionDetailScreen Component
 *
 * Modal screen showing full suggestion details:
 * - Title and description
 * - Time estimate
 * - List of ingredients (with urgency indicators)
 * - Preparation steps
 *
 * Part of H3.4: Detail view for making final decision in 2 taps.
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

import { cn } from '~/core/utils/cn';
import { SafeScreen } from '~/shared/components/safe-screen';

import { IngredientItem } from '../components/ingredient-item';
import { TimeBadge } from '../components/time-badge';
import { useSuggestions } from '../hooks/use-suggestions';

interface SuggestionDetailScreenProps {
  suggestionId: string;
}

export function SuggestionDetailScreen({ suggestionId }: SuggestionDetailScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { suggestions, loading } = useSuggestions();

  const suggestion = useMemo(
    () => suggestions.find((s) => s.id === suggestionId),
    [suggestions, suggestionId]
  );

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeScreen className="items-center justify-center">
        <ActivityIndicator size="large" color="#d97706" />
        <Text className="mt-4 text-neutral-600">{t('common.loading')}</Text>
      </SafeScreen>
    );
  }

  if (!suggestion) {
    return (
      <SafeScreen className="items-center justify-center p-8">
        <Text className="text-center text-lg text-neutral-600">{t('suggestion.not_found')}</Text>
        <Pressable
          onPress={handleClose}
          className="mt-6 rounded-lg bg-neutral-900 px-6 py-3 active:bg-neutral-800"
        >
          <Text className="font-semibold text-white">{t('common.close')}</Text>
        </Pressable>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-neutral-200 px-6 py-4">
        <View className="mr-4 flex-1">
          <Text className="mb-2 text-2xl font-bold text-neutral-900">{suggestion.title}</Text>
          <TimeBadge time={suggestion.estimatedTime} />
        </View>
        <Pressable onPress={handleClose} className="rounded-full p-2 active:bg-neutral-100">
          <X size={24} color="#171717" />
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {/* Description */}
        {suggestion.description && (
          <View className="border-b border-neutral-100 px-6 py-4">
            <Text className="text-base leading-6 text-neutral-700">{suggestion.description}</Text>
          </View>
        )}

        {/* Ingredients Section */}
        <View className="py-4">
          <Text className="mb-3 px-6 text-lg font-semibold text-neutral-900">
            {t('suggestion.ingredients_title')}
          </Text>
          <View>
            {suggestion.ingredients.map((ingredient) => (
              <IngredientItem key={ingredient.productId} ingredient={ingredient} />
            ))}
          </View>
        </View>

        {/* Steps Section */}
        {suggestion.steps && suggestion.steps.length > 0 && (
          <View className="border-t border-neutral-100 px-6 py-4">
            <Text className="mb-3 text-lg font-semibold text-neutral-900">
              {t('suggestion.steps_title')}
            </Text>
            <View>
              {suggestion.steps.map((step, index) => (
                <View key={index} className="mb-3 flex-row">
                  <View
                    className={cn(
                      'mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full',
                      'bg-neutral-900'
                    )}
                  >
                    <Text className="text-sm font-semibold text-white">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-base leading-6 text-neutral-700">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding for scroll */}
        <View className="h-8" />
      </ScrollView>

      {/* CTA Button */}
      <View className="border-t border-neutral-200 px-6 py-4">
        <Pressable
          onPress={handleClose}
          className="items-center rounded-lg bg-neutral-900 py-4 active:bg-neutral-800"
        >
          <Text className="text-lg font-semibold text-white">{t('suggestion.got_it')}</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}
