import { View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "~/core/utils/cn";

interface SafeScreenProps extends ViewProps {
  children: React.ReactNode;
  edges?: ("top" | "right" | "bottom" | "left")[];
}

export function SafeScreen({
  children,
  edges,
  className,
  ...props
}: SafeScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={cn("flex-1 bg-background", className)}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}

interface ScreenContentProps extends ViewProps {
  children: React.ReactNode;
}

export function ScreenContent({
  children,
  className,
  ...props
}: ScreenContentProps) {
  return (
    <View className={cn("flex-1 px-4", className)} {...props}>
      {children}
    </View>
  );
}
