import { createContext, type ReactNode, useContext, useMemo } from "react";

// Define the UseCases interface with all available use cases
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UseCases {}

const UseCaseContext = createContext<UseCases | null>(null);

export function UseCaseProvider({ children }: { children: ReactNode }) {
  // Get token from auth store

  const useCases = useMemo<UseCases>(() => {
    // Instantiate repositories

    return {
      // Authorization annotation use cases
    };
  }, []);

  return (
    <UseCaseContext.Provider value={useCases}>
      {children}
    </UseCaseContext.Provider>
  );
}

export function useUseCases(): UseCases {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error("useUseCases must be used within UseCaseProvider");
  }
  return context;
}
