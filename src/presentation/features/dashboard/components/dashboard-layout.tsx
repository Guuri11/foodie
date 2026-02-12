import { View } from 'react-native';

import type { Product } from '@domain/product/model';

import { PantryPanel } from './pantry-panel';
import { ShoppingListPanel } from './shopping-list-panel';
import { SuggestionsPanel } from './suggestions-panel';

interface DashboardLayoutProps {
  products: Product[];
}

export function DashboardLayout({ products }: DashboardLayoutProps) {
  return (
    <View className="flex-1 flex-row gap-4 px-6 pb-4">
      <View className="w-[60%]">
        <SuggestionsPanel />
      </View>
      <View className="w-[40%] gap-4">
        <View className="h-[60%]">
          <PantryPanel products={products} />
        </View>
        <View className="h-[40%]">
          <ShoppingListPanel />
        </View>
      </View>
    </View>
  );
}
