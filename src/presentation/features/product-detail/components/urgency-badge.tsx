import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { UrgencyInfo } from '@domain/product/urgency-messages';

import { cn } from '~/core/utils/cn';

interface UrgencyBadgeProps {
  urgencyInfo: UrgencyInfo;
  isEstimated?: boolean;
}

const URGENCY_STYLES: Record<string, string> = {
  use_soon: 'bg-amber-100',
  use_today: 'bg-orange-100',
  wouldnt_trust: 'bg-red-100',
};

const URGENCY_TEXT_STYLES: Record<string, string> = {
  use_soon: 'text-amber-800',
  use_today: 'text-orange-800',
  wouldnt_trust: 'text-red-800',
};

export function UrgencyBadge({ urgencyInfo, isEstimated }: UrgencyBadgeProps) {
  const { t } = useTranslation();

  if (urgencyInfo.level === 'ok') return null;

  const bgStyle = URGENCY_STYLES[urgencyInfo.level] ?? '';
  const textStyle = URGENCY_TEXT_STYLES[urgencyInfo.level] ?? '';

  return (
    <View className={cn('self-start rounded-full px-3 py-1.5', bgStyle)}>
      <Text className={cn('text-base font-medium', textStyle)}>
        {isEstimated && `${t('product_detail.expiry_estimated_prefix')} `}
        {t(urgencyInfo.messageKey)}
      </Text>
    </View>
  );
}
