import { View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

import { SafeScreen } from '~/shared/components/safe-screen';
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
      <SafeScreen className="items-center justify-center">
        <Text variant="muted">...</Text>
      </SafeScreen>
    );
  }

  if (error) {
    return (
      <SafeScreen className="items-center justify-center p-8">
        <Text variant="h4" className="text-destructive">
          Error
        </Text>
        <Text variant="muted" className="mt-2 text-center">
          {error.message}
        </Text>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <DashboardHeader />
      {hasActiveProducts ? (
        <DashboardLayout products={products} />
      ) : (
        <EmptyDashboard allFinished={allFinished} />
      )}
    </SafeScreen>
  );
}
