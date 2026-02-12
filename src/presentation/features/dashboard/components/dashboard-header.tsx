import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

export function DashboardHeader() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <Text variant="h3">Foodie</Text>
      <Button
        className="min-h-14 flex-row items-center gap-2 px-5"
        onPress={() => router.push('/modal/add-product')}
      >
        <Plus size={20} color="white" />
        <Text>{t('dashboard.header.add_button')}</Text>
      </Button>
    </View>
  );
}
