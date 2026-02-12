import { View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

import { Text } from '~/shared/ui/text';

import { DashboardHeader } from '../components/dashboard-header';
import { DashboardLayout } from '../components/dashboard-layout';
import { EmptyDashboard } from '../components/empty-dashboard';
import { useDashboard } from '../hooks/use-dashboard';

export function DashboardScreen() {
  useKeepAwake();

  const { products, loading, error, hasActiveProducts, allFinished } = useDashboard();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text variant="muted">...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <Text variant="h4" className="text-destructive">
          Error
        </Text>
        <Text variant="muted" className="mt-2 text-center">
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <DashboardHeader />
      {hasActiveProducts ? (
        <DashboardLayout products={products} />
      ) : (
        <EmptyDashboard allFinished={allFinished} />
      )}
    </View>
  );
}
