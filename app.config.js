module.exports = {
  expo: {
    name: 'foodie',
    slug: 'foodie',
    version: '1.0.0',
    orientation: 'landscape',
    icon: './src/presentation/assets/images/icon.png',
    scheme: 'foodie',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: 'We need the camera to scan receipts',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './src/presentation/assets/images/android-icon-foreground.png',
        backgroundImage: './src/presentation/assets/images/android-icon-background.png',
        monochromeImage: './src/presentation/assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.CAMERA'],
    },
    web: {
      output: 'static',
      bundler: 'metro',
      favicon: './src/presentation/assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-screen-orientation',
      [
        'expo-splash-screen',
        {
          image: './src/presentation/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'We need the camera to scan receipts.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:8080',
    },
  },
};
