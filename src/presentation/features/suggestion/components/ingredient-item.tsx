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
import { Text,View } from 'react-native';
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
    <View
      className={cn(
        'flex-row items-center py-3 px-4 border-b border-neutral-100',
        className
      )}
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-neutral-900">
          {ingredient.productName}
        </Text>
        {ingredient.quantity && (
          <Text className="text-sm text-neutral-600 mt-1">
            {ingredient.quantity}
          </Text>
        )}
      </View>

      {ingredient.isUrgent && (
        <View className="flex-row items-center ml-3">
          <AlertCircle size={18} color="#ea580c" className="mr-1" />
          <Text className="text-sm text-orange-600 font-medium">
            {t('suggestion.urgent')}
          </Text>
        </View>
      )}
    </View>
  );
}
