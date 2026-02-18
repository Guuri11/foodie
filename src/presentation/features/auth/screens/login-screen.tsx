import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '~/core/providers/auth-provider';
import { SafeScreen } from '~/shared/components/safe-screen';
import { Text } from '~/shared/ui/text';

type Mode = 'login' | 'register';

export function LoginScreen() {
  const { t } = useTranslation();
  const { authService } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await authService.signIn(email.trim(), password);
      } else {
        await authService.register(email.trim(), password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const isSubmitDisabled = loading || !email.trim() || !password;

  return (
    <SafeScreen className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="mb-12">
          <Text variant="h1" className="text-center">
            Foodie
          </Text>
          <Text variant="muted" className="mt-2 text-center">
            {t('auth.tagline')}
          </Text>
        </View>

        <View className="gap-4">
          <TextInput
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base"
            placeholder={t('auth.email_placeholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            editable={!loading}
          />

          <TextInput
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base"
            placeholder={t('auth.password_placeholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={mode === 'register' ? 'newPassword' : 'password'}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            editable={!loading}
          />

          {error && (
            <Text variant="muted" className="text-center text-destructive">
              {error}
            </Text>
          )}

          <Pressable
            className="mt-2 items-center rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {loading
                ? t('common.loading')
                : mode === 'login'
                  ? t('auth.sign_in')
                  : t('auth.register')}
            </Text>
          </Pressable>

          <Pressable className="mt-4 items-center" onPress={toggleMode} disabled={loading}>
            <Text variant="muted">
              {mode === 'login' ? t('auth.no_account') : t('auth.has_account')}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
