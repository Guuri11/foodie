import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAuth } from '~/core/providers/auth-provider';
import { SafeScreen } from '~/shared/components/safe-screen';
import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { user, authService } = useAuth();

  return (
    <SafeScreen className="items-center justify-center gap-6 px-8">
      <View className="items-center gap-2">
        <Text variant="h3">{t('profile.title')}</Text>
        {user?.email ? (
          <Text variant="muted">{user.email}</Text>
        ) : null}
      </View>

      <Button variant="outline" onPress={() => authService.signOut()}>
        <Text>{t('auth.sign_out')}</Text>
      </Button>
    </SafeScreen>
  );
}
