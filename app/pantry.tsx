import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

export default function PantryRoute() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Text variant="h3">{t('dashboard.pantry.title')}</Text>
      <Text variant="muted" className="mt-4">
        Coming soon
      </Text>
      <Button className="mt-8" onPress={() => router.back()}>
        <Text>Back</Text>
      </Button>
    </View>
  );
}
