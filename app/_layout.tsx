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

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const isTablet = useIsTablet();

  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  useEffect(() => {
    // Force light mode for NativeWind
    setColorScheme('light');
  }, [setColorScheme]);

  useEffect(() => {
    // Lock orientation based on device type
    if (isTablet) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, [isTablet]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <UseCaseProvider>
          <ThemeProvider value={NAV_THEME['light']}>
            <StatusBar style="dark" />
            <View className="flex-1">
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              >
                <Stack.Screen name="(tablet)" redirect={!isTablet} />
                <Stack.Screen name="(mobile)" redirect={isTablet} />
                <Stack.Screen
                  name="modal/add-product"
                  options={{ presentation: 'fullScreenModal' }}
                />
                <Stack.Screen name="modal/product/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="modal/suggestion/[id]" options={{ presentation: 'modal' }} />
              </Stack>
            </View>
            <PortalHost />
          </ThemeProvider>
        </UseCaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
