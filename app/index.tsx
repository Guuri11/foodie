import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-2xl font-bold text-neutral-950">Foodie App</Text>
        <Text className="mt-2 text-center text-base text-neutral-600">
          Your kitchen copilot
        </Text>
      </View>
    </SafeAreaView>
  );
}
