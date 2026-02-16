/**
 * SuggestionsPanel Component
 *
 * Main suggestions panel in the dashboard (60% left panel).
 * Shows 3-5 cooking suggestions based on pantry products.
 *
 * Part of Milestone 3: H3.1, H3.2, H3.3, H3.4
 */

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle } from '~/shared/ui/card';
import { Text } from '~/shared/ui/text';
import { SuggestionCard } from '~/features/suggestion/components/suggestion-card';
import { useSuggestions } from '~/features/suggestion/hooks/use-suggestions';

export function SuggestionsPanel() {
  const { t } = useTranslation();
  const { suggestions, loading, error } = useSuggestions();

  if (loading) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{t('dashboard.suggestions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#d97706" />
          <Text variant="muted" className="mt-4">
            {t('suggestion.loading')}
          </Text>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{t('dashboard.suggestions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 items-center justify-center">
          <Text variant="muted" className="text-red-600">
            {t('suggestion.error')}
          </Text>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{t('dashboard.suggestions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 items-center justify-center">
          <Text variant="muted">{t('suggestion.no_suggestions')}</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{t('dashboard.suggestions.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <View>
          {suggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
