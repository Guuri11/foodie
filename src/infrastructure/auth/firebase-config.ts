import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function createAuth(app: FirebaseApp): Auth {
  if (Platform.OS === 'web') {
    // On web, getAuth() defaults to browserLocalPersistence
    return getAuth(app);
  }

  // On native, use AsyncStorage-backed persistence
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getReactNativePersistence } = require('firebase/auth');
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

let app: FirebaseApp;
let auth: Auth;

// Guard against hot-reload re-initialization
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = createAuth(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { app as firebaseApp, auth as firebaseAuth };
