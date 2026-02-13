/**
 * SuggestionCard Component
 * 
 * Displays a single suggestion card with:
 * - Title
 * - Time estimate badge
 * - Urgent ingredient indicator
 * 
 * Part of H3.1, H3.2, H3.3: Display suggestions with urgency and time.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable,Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import type { Suggestion } from '@domain/suggestion/model';
import { hasUrgentIngredients } from '@domain/suggestion/model';

import { cn } from '~/core/utils/cn';

import { TimeBadge } from './time-badge';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onPress: (suggestion: Suggestion) => void;
  className?: string;
}

export function SuggestionCard({
  suggestion,
  onPress,
  className,
}: SuggestionCardProps) {
  const { t } = useTranslation();
  const urgent = hasUrgentIngredients(suggestion);

  return (
    <Pressable
      onPress={() => onPress(suggestion)}
      className={cn(
        'min-h-[56px] p-4 mb-3 bg-white rounded-lg border border-neutral-200',
        'active:bg-neutral-50',
        className
      )}
    >
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-lg font-semibold flex-1 mr-3">
          {suggestion.title}
        </Text>
        <TimeBadge time={suggestion.estimatedTime} />
      </View>

      {suggestion.description && (
        <Text className="text-sm text-neutral-600 mb-2">
          {suggestion.description}
        </Text>
      )}

      {urgent && (
        <View className="flex-row items-center mt-1">
          <AlertCircle size={16} color="#ea580c" className="mr-1" />
          <Text className="text-sm text-orange-600 font-medium">
            {t('suggestion.urgent_ingredient')}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
