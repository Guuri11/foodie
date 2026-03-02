import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, RefreshCw, ScanLine } from 'lucide-react-native';

import { SafeScreen } from '~/shared/components/safe-screen';
import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

import { SuggestionCard } from '../components/suggestion-card';
import { useSuggestions } from '../hooks/use-suggestions';

export function MobileSuggestionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { suggestions, loading, error, refresh } = useSuggestions();

  const handleAddPress = () => {
    router.push('/modal/add-product' as never);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#c2410c" />
          <Text variant="muted" className="mt-4">
            {t('suggestion.loading')}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text variant="muted" className="text-center text-muted-foreground">
            {t('suggestion.error')}
          </Text>
          <Button variant="outline" className="flex-row items-center gap-2" onPress={refresh}>
            <RefreshCw size={16} className="text-foreground" />
            <Text>{t('common.retry')}</Text>
          </Button>
        </View>
      );
    }

    if (suggestions.length === 0) {
      return (
        <View className="flex-1 items-center justify-center gap-6 px-8">
          <View className="items-center gap-2">
            <Text variant="h2" className="border-b-0 text-center">
              {t('dashboard.empty.tagline')}
            </Text>
            <Text variant="lead" className="text-center text-muted-foreground">
              {t('dashboard.empty.cta_text')}
            </Text>
          </View>

          <View className="w-full gap-3">
            <Button className="h-14 flex-row items-center gap-2" onPress={handleAddPress}>
              <ScanLine size={20} color="white" />
              <Text>{t('add_product.scan_button')}</Text>
            </Button>
            <Button
              variant="outline"
              className="h-12 flex-row items-center gap-2"
              onPress={handleAddPress}
            >
              <Plus size={18} className="text-foreground" />
              <Text>{t('dashboard.header.add_button')}</Text>
            </Button>
          </View>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 px-4 pt-2">
        <Text variant="h4" className="mb-4">
          {t('dashboard.suggestions.title')}
        </Text>
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text variant="h3">Foodie</Text>
        <Button className="min-h-12 flex-row items-center gap-2 px-4" onPress={handleAddPress}>
          <Plus size={18} color="white" />
          <Text>{t('dashboard.header.add_button')}</Text>
        </Button>
      </View>

      {renderContent()}
    </SafeScreen>
  );
}
