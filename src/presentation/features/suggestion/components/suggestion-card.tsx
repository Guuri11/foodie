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
import { Pressable, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import type { Suggestion } from '@domain/suggestion/model';
import { hasUrgentIngredients } from '@domain/suggestion/model';

import { cn } from '~/core/utils/cn';

import { TimeBadge } from './time-badge';

interface SuggestionCardProps {
  suggestion: Suggestion;
  className?: string;
}

export function SuggestionCard({ suggestion, className }: SuggestionCardProps) {
  const { t } = useTranslation();
  const urgent = hasUrgentIngredients(suggestion);

  return (
    <Pressable
      className={cn(
        'mb-3 min-h-[56px] rounded-lg border border-neutral-200 bg-white p-4',
        'active:bg-neutral-50',
        className
      )}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="mr-3 flex-1 text-lg font-semibold">{suggestion.title}</Text>
        <TimeBadge time={suggestion.estimatedTime} />
      </View>

      {suggestion.description && (
        <Text className="mb-2 text-sm text-neutral-600">{suggestion.description}</Text>
      )}

      {urgent && (
        <View className="mt-1 flex-row items-center">
          <AlertCircle size={16} color="#ea580c" className="mr-1" />
          <Text className="text-sm font-medium text-orange-600">
            {t('suggestion.urgent_ingredient')}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
