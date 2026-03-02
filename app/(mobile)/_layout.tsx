import { useTranslation } from 'react-i18next';
import { Tabs } from 'expo-router';
import { Archive, ShoppingCart, User, UtensilsCrossed } from 'lucide-react-native';

export default function MobileLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#c2410c',
        tabBarInactiveTintColor: '#d6d3d1',
        tabBarStyle: {
          backgroundColor: '#fffbeb',
          borderTopColor: '#e7e5e4',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.suggestions'),
          tabBarIcon: ({ color, size }) => <UtensilsCrossed size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: t('navigation.pantry'),
          tabBarIcon: ({ color, size }) => <Archive size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: t('navigation.shopping'),
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
