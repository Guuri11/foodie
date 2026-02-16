import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SafeScreen } from '~/shared/components/safe-screen';
import { Text } from '~/shared/ui/text';

import { PantryList } from '../components/pantry-list';
import { StatusFilterBar } from '../components/status-filter-bar';
import { usePantry } from '../hooks/use-pantry';

export function PantryScreen() {
  const { t } = useTranslation();
  const { products, selectedStatus, setSelectedStatus } = usePantry();

  const emptyMessage = selectedStatus === 'all' ? t('pantry.empty') : t('pantry.empty_filtered');

  return (
    <SafeScreen>
      <View className="px-4 pb-2 pt-6">
        <Text variant="h3">{t('pantry.title')}</Text>
      </View>
      <View className="py-3">
        <StatusFilterBar selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />
      </View>
      <PantryList products={products} emptyMessage={emptyMessage} />
    </SafeScreen>
  );
}
