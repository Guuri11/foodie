import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { SafeScreen } from '~/shared/components/safe-screen';
import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

import { SuggestionCard } from '../components/suggestion-card';
import { useSuggestions } from '../hooks/use-suggestions';

export function MobileSuggestionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { suggestions, loading, error } = useSuggestions();

  const handleAddPress = () => {
    router.push('/modal/add-product' as never);
  };

  if (loading) {
    return (
      <SafeScreen className="items-center justify-center">
        <ActivityIndicator size="large" color="#c2410c" />
        <Text variant="muted" className="mt-4">
          {t('suggestion.loading')}
        </Text>
      </SafeScreen>
    );
  }

  if (error) {
    return (
      <SafeScreen className="items-center justify-center p-8">
        <Text variant="muted" className="text-red-600">
          {t('suggestion.error')}
        </Text>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text variant="h3">Foodie</Text>
        <Button className="min-h-12 flex-row items-center gap-2 px-4" onPress={handleAddPress}>
          <Plus size={18} color="white" />
          <Text>{t('dashboard.header.add_button')}</Text>
        </Button>
      </View>

      {suggestions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text variant="h2" className="border-b-0 text-center">
            {t('dashboard.empty.tagline')}
          </Text>
          <Text variant="lead" className="mt-3 text-center text-muted-foreground">
            {t('suggestion.no_suggestions')}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2">
          <Text variant="h4" className="mb-4">
            {t('dashboard.suggestions.title')}
          </Text>
          {suggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </ScrollView>
      )}
    </SafeScreen>
  );
}
