import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { SafeScreen } from '~/shared/components/safe-screen';
import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

import { PantryList } from '../components/pantry-list';
import { StatusFilterBar } from '../components/status-filter-bar';
import { usePantry } from '../hooks/use-pantry';

export function PantryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { products, selectedStatus, setSelectedStatus } = usePantry();

  const emptyMessage = selectedStatus === 'all' ? t('pantry.empty') : t('pantry.empty_filtered');

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-6">
        <Text variant="h3">{t('pantry.title')}</Text>
        <Button
          className="min-h-10 flex-row items-center gap-2 px-3"
          onPress={() => router.push('/modal/add-product' as never)}
        >
          <Plus size={18} color="white" />
          <Text>{t('dashboard.header.add_button')}</Text>
        </Button>
      </View>
      <View className="py-3">
        <StatusFilterBar selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />
      </View>
      <PantryList products={products} emptyMessage={emptyMessage} />
    </SafeScreen>
  );
}
