/**
 * IngredientItem Component
 *
 * Displays a single ingredient in the suggestion detail modal.
 * Shows urgency indicator if ingredient is expiring soon.
 *
 * Part of H3.4: Detail view with ingredients list.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import type { SuggestionIngredient } from '@domain/suggestion/model';

import { cn } from '~/core/utils/cn';

interface IngredientItemProps {
  ingredient: SuggestionIngredient;
  className?: string;
}

export function IngredientItem({ ingredient, className }: IngredientItemProps) {
  const { t } = useTranslation();

  return (
    <View className={cn('flex-row items-center border-b border-neutral-100 px-4 py-3', className)}>
      <View className="flex-1">
        <Text className="text-base font-medium text-neutral-900">{ingredient.productName}</Text>
        {ingredient.quantity && (
          <Text className="mt-1 text-sm text-neutral-600">{ingredient.quantity}</Text>
        )}
      </View>

      {ingredient.isUrgent && (
        <View className="ml-3 flex-row items-center">
          <AlertCircle size={18} color="#ea580c" className="mr-1" />
          <Text className="text-sm font-medium text-orange-600">{t('suggestion.urgent')}</Text>
        </View>
      )}
    </View>
  );
}
