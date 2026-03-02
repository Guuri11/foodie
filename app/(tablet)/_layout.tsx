import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';

export default function TabletLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="pantry" options={{ headerShown: true, title: t('pantry.title') }} />
      <Stack.Screen
        name="shopping-list"
        options={{ headerShown: true, title: t('navigation.shopping') }}
      />
    </Stack>
  );
}
