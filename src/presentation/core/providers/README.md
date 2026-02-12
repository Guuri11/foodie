# Dependency Injection (DI) with UseCaseProvider

This directory contains the **Dependency Injection** setup for the Transit application using React Context.

## Overview

The `UseCaseProvider` is a React Context provider that creates and provides all use case instances to the application. This pattern ensures:

- **Centralized dependency management**: All use cases are instantiated in one place
- **Type safety**: Full TypeScript support for all use cases
- **Testability**: Easy to mock in tests by providing custom contexts
- **Single responsibility**: Each component accesses only the use cases it needs

## Architecture

```
UseCaseProvider (React Context)
    ↓
Creates Repositories
    ↓
Creates Use Cases (with Repository + Logger)
    ↓
Provides via Context
    ↓
useUseCases() hook
    ↓
Feature Hooks (e.g., useDriver)
    ↓
Screens
```

## Usage

### 1. Provider Setup (Already done in `app/_layout.tsx`)

```typescript
import { UseCaseProvider } from '~/core/providers/use-case-provider';

export default function RootLayout() {
  return (
    <UseCaseProvider>
      {/* Your app content */}
    </UseCaseProvider>
  );
}
```

### 2. Accessing Use Cases in Feature Hooks

**✅ CORRECT - Use in feature hooks:**

```typescript
// features/driver/hooks/use-driver.ts
import { useUseCases } from '~/core/providers/use-case-provider';

export function useDriver(id: string) {
  const { getDriverById } = useUseCases(); // ✅ DI via context

  // Use the use case
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    getDriverById.execute(id).then(setDriver);
  }, [id, getDriverById]);

  return { driver };
}
```

### 3. Using Feature Hooks in Screens

**Screens** can use feature hooks that access DI:

```typescript
// features/driver/screens/driver-detail-screen.tsx
export function DriverDetailScreen() {
  const { id } = useLocalSearchParams();
  const { driver, loading, error } = useDriver(id); // ✅ Hook with DI

  return <DriverDetailView driver={driver} />;
}
```

### 4. Components Receive Data via Props

**❌ WRONG - Components CANNOT use DI directly:**

```typescript
// features/driver/components/driver-detail-view.tsx
export function DriverDetailView({ driver }: Props) {
  // ❌ NEVER do this in a component:
  // const { getDriverById } = useUseCases();

  // ✅ Components only receive data via props
  return <View>{driver.name}</View>;
}
```

## Adding New Use Cases

When implementing a new feature, follow these steps:

### 1. Create Domain Layer

```typescript
// src/domain/entity/use_cases/operation.ts
export interface OperationUseCase {
  execute(params: Params): Promise<Result>;
}
```

### 2. Create Application Layer

```typescript
// src/application/usecases/entity/operation.ts
import type { OperationUseCase } from '@domain/entity/use_cases/operation';
import type { Logger } from '@domain/logger';

export class OperationUseCaseImpl implements OperationUseCase {
  constructor(
    private readonly repository: Repository,
    private readonly logger: Logger
  ) {}

  async execute(params: Params): Promise<Result> {
    this.logger.info('Executing operation', { params });
    return await this.repository.doSomething(params);
  }
}
```

### 3. Create Infrastructure Layer

```typescript
// src/infrastructure/repositories/entity/repository-http.ts
export class RepositoryHttp implements Repository {
  async doSomething(params: Params): Promise<Result> {
    const response = await fetch(`${BASE_URL}/endpoint`, { ... });
    return response.json();
  }
}
```

### 4. Register in UseCaseProvider

```typescript
// src/presentation/core/providers/use-case-provider.tsx
import type { OperationUseCase } from '@domain/entity/use_cases/operation';
import { OperationUseCaseImpl } from '@application/usecases/entity/operation';
import { RepositoryHttp } from '@infrastructure/repositories/entity/repository-http';

export interface UseCases {
  // ... existing use cases
  operation: OperationUseCase; // Add new use case
}

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const useCases = useMemo<UseCases>(() => {
    // Instantiate repositories
    const repo = new RepositoryHttp();

    return {
      // ... existing use cases
      operation: new OperationUseCaseImpl(repo, logger), // Register
    };
  }, []);

  // ...
}
```

### 5. Create Feature Hook

```typescript
// src/presentation/features/entity/hooks/use-operation.ts
import { useUseCases } from '~/core/providers/use-case-provider';

export function useOperation() {
  const { operation } = useUseCases();

  const [result, setResult] = useState(null);

  const execute = async (params: Params) => {
    const data = await operation.execute(params);
    setResult(data);
  };

  return { result, execute };
}
```

### 6. Use in Screen

```typescript
// src/presentation/features/entity/screens/operation-screen.tsx
export function OperationScreen() {
  const { result, execute } = useOperation();

  return <OperationView result={result} onExecute={execute} />;
}
```

## Testing

### Mocking UseCases in Tests

```typescript
import { renderHook } from '@testing-library/react-native';
import { useUseCases } from '~/core/providers/use-case-provider';

jest.mock('~/core/providers/use-case-provider');

describe('useDriver hook', () => {
  const mockGetDriverById = jest.fn();

  beforeEach(() => {
    jest.mocked(useUseCases).mockReturnValue({
      getDriverById: { execute: mockGetDriverById },
    } as any);
  });

  it('fetches driver on mount', async () => {
    mockGetDriverById.mockResolvedValue(mockDriver);

    const { result } = renderHook(() => useDriver('123'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.driver).toEqual(mockDriver);
  });
});
```

## Benefits of This Pattern

✅ **Centralized**: All dependencies created in one place
✅ **Type-safe**: Full TypeScript autocomplete and type checking
✅ **Testable**: Easy to mock entire UseCases context
✅ **Maintainable**: Clear dependency graph
✅ **React Native compatible**: Works seamlessly with Expo and React Native
✅ **No magic**: Simple React Context, no decorators or reflection

## Comparison with Other Patterns

### vs Singleton DI Container (Totem App)

**Totem App (Tauri + React Web):**

```typescript
// Uses singleton container
const container = DependencyContainer.getInstance();
const useCase = container.createUseCase();
```

**Transit (React Native + Expo):**

```typescript
// Uses React Context
const { useCase } = useUseCases();
```

Both patterns work well. React Context is more idiomatic for React Native apps.

## Rules

✅ **DO:**

- Use `useUseCases()` in **feature hooks** only
- Create feature hooks to encapsulate use case logic
- Use feature hooks in **screens**
- Pass data to **components** via props

❌ **DON'T:**

- Use `useUseCases()` directly in **components** (presentational)
- Use `useUseCases()` in **routes** (thin wrappers)
- Use `useUseCases()` in **shared components**
- Instantiate use cases or repositories directly (use DI)

## References

- See [copilot-instructions.md](../../../../copilot-instructions.md) for full architecture guidelines
- See [CLAUDE.md](../../../../CLAUDE.md) for detailed DI patterns
- Example implementation: `src/presentation/features/driver/`
