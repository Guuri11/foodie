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
import { ActivityIndicator,Pressable, ScrollView, Text, View } from 'react-native';
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
        <Text className="text-neutral-600 mt-4">{t('common.loading')}</Text>
      </SafeScreen>
    );
  }

  if (!suggestion) {
    return (
      <SafeScreen className="items-center justify-center p-8">
        <Text className="text-lg text-neutral-600 text-center">
          {t('suggestion.not_found')}
        </Text>
        <Pressable
          onPress={handleClose}
          className="mt-6 px-6 py-3 bg-neutral-900 rounded-lg active:bg-neutral-800"
        >
          <Text className="text-white font-semibold">{t('common.close')}</Text>
        </Pressable>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-200">
        <View className="flex-1 mr-4">
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            {suggestion.title}
          </Text>
          <TimeBadge time={suggestion.estimatedTime} />
        </View>
        <Pressable
          onPress={handleClose}
          className="p-2 rounded-full active:bg-neutral-100"
        >
          <X size={24} color="#171717" />
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {/* Description */}
        {suggestion.description && (
          <View className="px-6 py-4 border-b border-neutral-100">
            <Text className="text-base text-neutral-700 leading-6">
              {suggestion.description}
            </Text>
          </View>
        )}

        {/* Ingredients Section */}
        <View className="py-4">
          <Text className="text-lg font-semibold text-neutral-900 px-6 mb-3">
            {t('suggestion.ingredients_title')}
          </Text>
          <View>
            {suggestion.ingredients.map((ingredient) => (
              <IngredientItem
                key={ingredient.productId}
                ingredient={ingredient}
              />
            ))}
          </View>
        </View>

        {/* Steps Section */}
        {suggestion.steps && suggestion.steps.length > 0 && (
          <View className="px-6 py-4 border-t border-neutral-100">
            <Text className="text-lg font-semibold text-neutral-900 mb-3">
              {t('suggestion.steps_title')}
            </Text>
            <View>
              {suggestion.steps.map((step, index) => (
                <View key={index} className="flex-row mb-3">
                  <View
                    className={cn(
                      'w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5',
                      'bg-neutral-900'
                    )}
                  >
                    <Text className="text-white text-sm font-semibold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-base text-neutral-700 leading-6">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding for scroll */}
        <View className="h-8" />
      </ScrollView>

      {/* CTA Button */}
      <View className="px-6 py-4 border-t border-neutral-200">
        <Pressable
          onPress={handleClose}
          className="py-4 bg-neutral-900 rounded-lg active:bg-neutral-800 items-center"
        >
          <Text className="text-white text-lg font-semibold">
            {t('suggestion.got_it')}
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}
