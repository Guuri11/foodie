import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

interface EmptyDashboardProps {
  allFinished?: boolean;
}

export function EmptyDashboard({ allFinished = false }: EmptyDashboardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text variant="h2" className="border-b-0 text-center">
        {allFinished ? t('dashboard.empty.all_finished') : t('dashboard.empty.tagline')}
      </Text>
      {!allFinished && (
        <Text variant="lead" className="mt-3 text-center text-muted-foreground">
          {t('dashboard.empty.cta_text')}
        </Text>
      )}
      <Button
        className="mt-8 min-h-14 flex-row items-center gap-2 px-6"
        onPress={() => router.push('/modal/add-product')}
      >
        <Plus size={20} color="white" />
        <Text>{t('dashboard.empty.add_products')}</Text>
      </Button>
    </View>
  );
}
