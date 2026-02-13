/**
 * TimeBadge Component
 * 
 * Displays time estimate for a suggestion.
 * Part of H3.3: Time estimate display.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Clock } from 'lucide-react-native';

import type { TimeRange } from '@domain/suggestion/model';

import { cn } from '~/core/utils/cn';

interface TimeBadgeProps {
  time: TimeRange;
  className?: string;
}

export function TimeBadge({ time, className }: TimeBadgeProps) {
  const { t } = useTranslation();

  const colorClass = {
    quick: 'bg-green-100 text-green-800',
    medium: 'bg-orange-100 text-orange-800',
    long: 'bg-red-100 text-red-800',
  }[time];

  return (
    <View
      className={cn(
        'flex-row items-center px-2 py-1 rounded-full',
        colorClass,
        className
      )}
    >
      <Clock size={14} className="mr-1" color="currentColor" />
      <Text className="text-sm font-medium">
        {t(`suggestion.time_${time}`)}
      </Text>
    </View>
  );
}
