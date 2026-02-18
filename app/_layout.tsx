import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito-sans';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { useIsTablet } from '~/core/hooks/use-device';
import { AuthProvider, useAuth } from '~/core/providers/auth-provider';
import { UseCaseProvider } from '~/core/providers/use-case-provider';

import { NAV_THEME } from '~/lib/theme';

import '@/global.css';

import '~/lib/i18n';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const isTablet = useIsTablet();
  const { isAuthenticated, isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('light');
  }, [setColorScheme]);

  useEffect(() => {
    if (isTablet) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, [isTablet]);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME['light']}>
      <StatusBar style="dark" />
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="(auth)" redirect={isAuthenticated} />
          <Stack.Screen name="(tablet)" redirect={!isTablet || !isAuthenticated} />
          <Stack.Screen name="(mobile)" redirect={isTablet || !isAuthenticated} />
          <Stack.Screen name="modal/add-product" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="modal/product/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </View>
      <PortalHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AuthProvider>
          <UseCaseProvider>
            <RootNavigator />
          </UseCaseProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
