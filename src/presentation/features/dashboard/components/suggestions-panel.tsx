import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '~/shared/ui/card';
import { Text } from '~/shared/ui/text';

export function SuggestionsPanel() {
  const { t } = useTranslation();

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{t('dashboard.suggestions.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 items-center justify-center">
        <Text variant="muted">{t('dashboard.suggestions.empty')}</Text>
      </CardContent>
    </Card>
  );
}
