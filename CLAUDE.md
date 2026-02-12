# Claude Code Instructions for Foodie

> Instructions for Claude Code (AI assistant) when working on this React Native mobile application.

## Project Overview

**Foodie** is a mobile application that helps people manage their kitchen inventory and decide what to eat quickly. It's designed as "the quiet copilot of your kitchen" - observing, remembering, suggesting, never judging.

**Core Philosophy**: Reduce mental load, don't add features. The app should remove noise, not create it.

**Development Approach**: This project follows **Test-Driven Development (TDD)** to ensure code quality and regression protection.

## Product Principles

These principles govern **every decision** in this project:

### What We Believe

- People don't fail at cooking: **they're tired**.
- The problem isn't "what recipe", it's **what decision**.
- Less options = more action.
- A kitchen app should **remove noise**, not add it.

### What We Do

- Remember what you don't want to remember.
- Suggest, don't impose.
- Optimize for normal days, not ideal Sundays.
- Convert "I don't know what to eat" into an immediate answer.

### What We Will NOT Do (Clear Limits)

- NO guilt-tripping users for wasting food.
- NO demanding absurd precision.
- NO gamifying the fridge.
- NO showing 50 recipes when 3 are enough.

### Key Metrics (North Star)

Not:

- Time in app
- Number of saved recipes

Yes:

- **Time until deciding what to eat** (< 10 seconds target)
- **Times the app prevents food waste**
- **Times the user doesn't need to open the app** (paradoxical but valuable)

### Brand Voice

- **Calm**: Nothing blinks, nothing screams
- **Clarity**: Few words, few colors, few options
- **Complicity**: Accompanies, doesn't correct

**Microcopy examples:**

- ✅ "Use this today" (NOT "Optimize consumption patterns")
- ✅ "Avoid wasting food" (NOT "Reduce food waste")
- ✅ "Decide what to eat today" (NOT "Plan your weekly meals")

## Core Technologies

- **React Native** 0.81.5 + **Expo** 54.0.33
- **Expo Router** 6.0.23 (file-based routing)
- **TypeScript** 5.9.2 (strict mode)
- **NativeWind** 4.2.1 (Tailwind CSS for RN)
- **Zustand** (state management)
- **i18next** (internationalization)
- **Jest** + **jest-expo** (testing)

## Architecture

### Hexagonal Architecture (Ports & Adapters)

The project is structured in **four main layers**:

```
app/                      # Expo Router routes (entry points)
src/
  ├── domain/            # Pure business logic (NO dependencies)
  ├── application/       # Use case implementations
  ├── infrastructure/    # External adapters (HTTP, storage)
  └── presentation/      # UI layer (React Native)
      ├── core/         # DI, hooks, utils
      ├── shared/       # Reusable components
      ├── features/     # Feature modules
      ├── lib/          # Global stores, i18n, theme
      └── assets/       # Static assets
```

### Dependency Rule

**Dependencies MUST flow inward**:

```
Presentation → Infrastructure → Application → Domain
```

- **Domain** depends on NOTHING
- **Application** depends on Domain only
- **Infrastructure** depends on Domain and Application
- **Presentation** depends on all layers (via DI)

### Path Aliases

```typescript
~/*               → src/presentation/*
~/core/*          → src/presentation/core/*
~/shared/*        → src/presentation/shared/*
~/features/*      → src/presentation/features/*
~/lib/*           → src/presentation/lib/*
@domain/*         → src/domain/*
@application/*    → src/application/*
@infrastructure/* → src/infrastructure/*
```

## Architectural Guidelines

### 1. Domain Layer (`src/domain/`)

**Pure business logic with NO external dependencies.**

Structure per entity:

```
domain/<entity>/
  ├── model.ts              # Domain models and aggregates
  ├── value_objects.ts      # Value objects
  ├── errors.ts             # Domain errors (code-style identifiers)
  ├── repository.ts         # Repository interfaces (ports)
  └── use_cases/            # Use case interfaces (contracts)
```

**Rules:**

- ✅ Only TypeScript, no libraries
- ✅ Validate business rules in constructors
- ✅ Use code-style error identifiers (`not_found`, `expired`, `already_used`)
- ❌ NO HTTP, database, UI, or Expo dependencies
- ❌ NO implementation details

**Example:**

```typescript
// domain/product/model.ts
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly expiryDate: Date | null,
    public readonly status: ProductStatus
  ) {
    if (!name.trim()) throw ProductError.ValidationError('name_empty');
    if (status === 'opened' && !expiryDate) {
      throw ProductError.ValidationError('opened_product_needs_expiry');
    }
  }

  isExpiringSoon(): boolean {
    if (!this.expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (this.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 2 && daysUntilExpiry >= 0;
  }

  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return this.expiryDate < new Date();
  }
}
```

### 2. Application Layer (`src/application/usecases/`)

**Orchestrates domain logic. Implements use case interfaces.**

**Rules:**

- ✅ Depends on domain abstractions (interfaces)
- ✅ Uses dependency injection (constructor)
- ✅ Logs operations via injected logger
- ❌ NO concrete infrastructure implementations
- ❌ NO UI or React dependencies

**Example:**

```typescript
// application/usecases/product/get-suggestions.ts
import type { GetSuggestionsUseCase } from '@domain/product/use_cases/get-suggestions';
import type { ProductRepository } from '@domain/product/repository';
import type { Logger } from '@domain/logger';

export class GetSuggestionsUseCaseImpl implements GetSuggestionsUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(limit: number = 5): Promise<Product[]> {
    this.logger.info('Getting product suggestions', { limit });

    const products = await this.repository.getAll();

    // Business logic: prioritize expiring products
    const sorted = products.sort((a, b) => {
      if (a.isExpired() && !b.isExpired()) return -1;
      if (!a.isExpired() && b.isExpired()) return 1;
      if (a.isExpiringSoon() && !b.isExpiringSoon()) return -1;
      if (!a.isExpiringSoon() && b.isExpiringSoon()) return 1;
      return 0;
    });

    return sorted.slice(0, limit);
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Adapters for external systems.**

Structure:

```
infrastructure/
  ├── repositories/      # Repository implementations
  ├── services/          # External service adapters
  └── logger/            # Logger implementations
```

**Rules:**

- ✅ Implements domain repository interfaces
- ✅ Handles storage, external APIs
- ✅ Maps DTOs to domain models
- ❌ NO business logic
- ❌ NO UI dependencies

**Example:**

```typescript
// infrastructure/repositories/product/product-repository-local.ts
import type { ProductRepository } from '@domain/product/repository';
import type { Product } from '@domain/product/model';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ProductRepositoryLocal implements ProductRepository {
  private readonly STORAGE_KEY = '@foodie:products';

  async getAll(): Promise<Product[]> {
    const json = await AsyncStorage.getItem(this.STORAGE_KEY);
    if (!json) return [];

    const dtos = JSON.parse(json);
    return dtos.map(this.mapToProduct);
  }

  async save(product: Product): Promise<void> {
    const products = await this.getAll();
    const updated = [...products.filter((p) => p.id !== product.id), product];

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  private mapToProduct(dto: any): Product {
    return new Product(
      dto.id,
      dto.name,
      dto.expiryDate ? new Date(dto.expiryDate) : null,
      dto.status
    );
  }
}
```

### 4. Presentation Layer (`src/presentation/`)

**UI layer with React Native components.**

#### 4.1 Core (`~/core/`)

Cross-cutting concerns:

- **`providers/`**: Dependency Injection (`UseCaseProvider`)
- **`hooks/`**: Generic reusable hooks
- **`utils/`**: Utility functions (`cn` for classnames)

**Rules:**

- ✅ Generic and domain-agnostic
- ❌ NO feature-specific dependencies

#### 4.2 Shared (`~/shared/`)

Reusable UI components:

- **`ui/ui/`**: Base UI components
- **`components/`**: Domain-agnostic components
- **`layout/`**: Layout components

**Rules:**

- ✅ Fully reusable across features
- ✅ Can use domain types for props
- ❌ NO dependencies on specific features
- ❌ NO use case or business logic

#### 4.3 Features (`~/features/`)

Feature modules organized by domain:

```
features/<feature>/
  ├── screens/          # Smart components (data fetching)
  ├── components/       # Presentational (pure UI)
  ├── hooks/            # Feature hooks with DI
  └── stores/           # Feature state (Zustand)
```

**Screens vs Components:**

**Screens** (Smart):

- Can use `useUseCases()` hook
- Handle data fetching and logic
- Pass data to components as props

**Components** (Presentational):

- CANNOT use `useUseCases()` hook
- Pure UI, no business logic
- Receive all data via props

**Rules:**

- ✅ Can depend on domain, application (via DI), core, shared
- ✅ Screens use DI for use cases
- ❌ Components cannot access use cases directly
- ❌ Features should not depend on each other

**Example:**

```typescript
// features/suggestions/screens/suggestions-screen.tsx
export function SuggestionsScreen() {
  const { products, loading, error } = useSuggestions(); // Hook with DI

  return <SuggestionsView products={products} loading={loading} error={error} />;
}

// features/suggestions/components/suggestions-view.tsx
interface Props {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

export function SuggestionsView({ products, loading, error }: Props) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-bold px-4 py-2">What can I eat now?</Text>
      {products.length === 0 ? (
        <Text className="px-4 text-neutral-600">Add products to get started</Text>
      ) : (
        products.map((product) => <ProductCard key={product.id} product={product} />)
      )}
    </View>
  );
}
```

#### 4.4 Lib (`~/lib/`)

- **`stores/`**: Global Zustand stores
- **`locales/`**: i18n files (`en.json`, `es.json`)
- **`theme.ts`**: Theme configuration
- **`i18n.ts`**: i18n setup

#### 4.5 Routes (`app/`)

**Expo Router** file-based routing:

```typescript
// app/index.tsx
import { SuggestionsScreen } from '~/features/suggestions/screens/suggestions-screen';

export default function HomeRoute() {
  return <SuggestionsScreen />;
}
```

**Rules:**

- ✅ Thin wrappers that render screens (< 50 lines)
- ✅ Can import from any presentation layer
- ❌ NO business logic
- ❌ NO use case access

## Dependency Injection

**CRITICAL**: Never instantiate use cases or repositories directly.

**✅ CORRECT:**

```typescript
export function useProducts() {
  const { getProducts } = useUseCases(); // From context
  // ...
}
```

**❌ WRONG:**

```typescript
export function useProducts() {
  const getProducts = new GetProductsImpl(...); // Never!
}
```

## Internationalization (i18n)

All user-facing text MUST use i18n:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('suggestions.empty')}</Text>;
}
```

**Rules:**

- ✅ Add keys to BOTH `en.json` and `es.json`
- ✅ Use code-style identifiers (`product.error.expired`)
- ✅ Keep voice calm and clear (see Brand Voice above)
- ❌ Never hardcode user-facing strings

**Key structure example:**

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong"
  },
  "product": {
    "add": "Add product",
    "status": {
      "new": "New",
      "opened": "Opened",
      "almost_empty": "Almost empty"
    },
    "urgency": {
      "use_today": "Use today",
      "use_soon": "Use soon",
      "wouldnt_trust": "I wouldn't trust it"
    }
  },
  "suggestions": {
    "title": "What can I eat now?",
    "empty": "Add what you have to get started",
    "no_urgent": "All good for now. Check your stock if you want."
  }
}
```

## Testing Philosophy & Strategy

This project follows **Test-Driven Development (TDD)**, focusing on **business requirements verification** over code coverage percentages.

### Core Testing Principles

1. **Tests verify business functionality, not implementation details**
2. **User-centric testing: tests describe what users experience**
3. **Given-When-Then narrative structure for readability**
4. **Collaboration-first: define scenarios together, then implement**

### TDD Core Principles

**CRITICAL:** Tests are written FIRST, before implementation.

**The TDD Cycle (Red-Green-Refactor):**

1. **RED** - Write failing test describing business requirement
2. **GREEN** - Write minimal code to make test pass
3. **REFACTOR** - Improve code quality without changing behavior

### Test Naming Convention

**Pattern:** `should_<BUSINESS_EXPECTATION>_when_<BUSINESS_SCENARIO>`

Focus on **business behavior**, not technical implementation.

**✅ Good (Business-Focused):**

- `should_show_product_first_when_expiring_today`
- `should_prevent_adding_product_without_name`
- `should_estimate_expiry_when_product_opened`

**❌ Bad (Implementation-Focused):**

- `should_return_array_when_calling_getAll`
- `should_call_repository_save_method`
- `should_set_status_field_to_opened`

### Test Structure (AAA Pattern with Business Context)

**Tests should read like documentation - telling a story about how the system works.**

Use narrative `describe` blocks and `it` statements with **Given-When-Then** comments:

```typescript
describe('GetSuggestionsUseCase', () => {
  describe('Prioritizing products', () => {
    it('returns expiring products first when multiple products exist', async () => {
      // Given we have products with different expiry dates
      const expiringProduct = new Product('1', 'Milk', tomorrowDate, 'opened');
      const freshProduct = new Product('2', 'Rice', nextWeekDate, 'new');
      const mockRepo = {
        getAll: jest.fn().mockResolvedValue([freshProduct, expiringProduct]),
      };
      const mockLogger = { info: jest.fn(), error: jest.fn() };
      const useCase = new GetSuggestionsUseCaseImpl(mockRepo, mockLogger);

      // When we request suggestions
      const result = await useCase.execute(5);

      // Then expiring product appears first
      expect(result[0]).toEqual(expiringProduct);
      expect(result[1]).toEqual(freshProduct);
      expect(mockLogger.info).toHaveBeenCalledWith('Getting product suggestions', {
        limit: 5,
      });
    });

    it('limits results when more products than limit exist', async () => {
      // Given we have 10 products
      // When we request only 3 suggestions
      // Then we receive exactly 3 products
    });
  });

  describe('Edge cases', () => {
    it('returns empty array when no products exist', async () => {
      // Given the user has no products yet
      // When we request suggestions
      // Then we receive an empty array
    });
  });
});
```

### What to Test by Layer

#### ✅ **Domain Layer (Unit Tests - ~20%)**

**What to test:**

- **Models**: Validation rules, business constraints
- **Business logic methods**: `isExpiringSoon()`, `isExpired()`
- **Value Objects**: Immutability, valid states
- **Errors**: Domain-specific error types

**DO NOT test:**

- Simple getters/setters
- DTOs without logic

**Example:**

```typescript
describe('Product model', () => {
  describe('Validation', () => {
    it('rejects empty name when creating product', () => {
      // Given an empty name
      // When creating a product
      // Then validation error is thrown
      expect(() => new Product('123', '', null, 'new')).toThrow('name_empty');
    });

    it('requires expiry date when status is opened', () => {
      // Given an opened status without expiry date
      // When creating a product
      // Then validation error is thrown
      expect(() => new Product('123', 'Milk', null, 'opened')).toThrow(
        'opened_product_needs_expiry'
      );
    });
  });

  describe('Expiry logic', () => {
    it('identifies product as expiring soon when 2 days remain', () => {
      // Given a product expiring in 2 days
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const product = new Product('1', 'Milk', twoDaysFromNow, 'opened');

      // When checking if expiring soon
      const result = product.isExpiringSoon();

      // Then it returns true
      expect(result).toBe(true);
    });
  });
});
```

#### ✅ **Application Layer (Unit Tests - ~20%)**

**What to test:**

- **Use Cases**: Business logic orchestration with mocked repositories
- **Happy paths**: Normal successful execution
- **Error scenarios**: Domain errors, repository failures
- **Edge cases**: Empty results, boundary conditions
- **Logging**: Verify appropriate log messages

**Example:**

```typescript
describe('GetSuggestionsUseCase', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: Logger;
  let useCase: GetSuggestionsUseCaseImpl;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ProductRepository>;
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    useCase = new GetSuggestionsUseCaseImpl(mockRepository, mockLogger);
  });

  it('returns prioritized products when products exist', async () => {
    // Given we have products with different urgencies
    const expiredProduct = new Product('1', 'Yogurt', yesterday, 'opened');
    const expiringProduct = new Product('2', 'Milk', tomorrow, 'opened');
    const freshProduct = new Product('3', 'Rice', nextWeek, 'new');

    jest
      .mocked(mockRepository.getAll)
      .mockResolvedValue([freshProduct, expiredProduct, expiringProduct]);

    // When we execute the use case
    const result = await useCase.execute(5);

    // Then products are sorted by urgency
    expect(result[0]).toEqual(expiredProduct);
    expect(result[1]).toEqual(expiringProduct);
    expect(result[2]).toEqual(freshProduct);
    expect(mockLogger.info).toHaveBeenCalledWith('Getting product suggestions', {
      limit: 5,
    });
  });
});
```

#### ✅ **Infrastructure Layer (Integration Tests - ~70%)**

**What to test:**

- **Repositories**: AsyncStorage integration with mocked storage
- **DTOs**: Mapping to/from domain models
- **Error handling**: Storage failures

**Example:**

```typescript
describe('ProductRepositoryLocal', () => {
  let repository: ProductRepositoryLocal;

  beforeEach(() => {
    AsyncStorage.clear();
    repository = new ProductRepositoryLocal();
  });

  it('persists and retrieves products correctly', async () => {
    // Given a product to save
    const product = new Product('1', 'Milk', tomorrow, 'opened');

    // When saving the product
    await repository.save(product);

    // Then we can retrieve it
    const products = await repository.getAll();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Milk');
  });
});
```

#### ✅ **Presentation Layer (Integration Tests - Focus Area)**

**Test Hooks** (Complex logic orchestrating use cases):

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';

describe('useSuggestions hook', () => {
  const mockGetSuggestions = jest.fn();

  beforeEach(() => {
    jest.mocked(useUseCases).mockReturnValue({
      getSuggestions: { execute: mockGetSuggestions },
    } as any);
  });

  it('loads suggestions when hook is mounted', async () => {
    // Given suggestions exist
    const mockProducts = [
      new Product('1', 'Milk', tomorrow, 'opened'),
      new Product('2', 'Rice', nextWeek, 'new'),
    ];
    mockGetSuggestions.mockResolvedValue(mockProducts);

    // When hook is rendered
    const { result } = renderHook(() => useSuggestions());

    // Then suggestions are loaded
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual(mockProducts);
  });

  it('exposes error when fetch fails', async () => {
    // Given fetch will fail
    mockGetSuggestions.mockRejectedValue(new Error('Storage error'));

    // When hook is rendered
    const { result } = renderHook(() => useSuggestions());

    // Then error is exposed to UI
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.loading).toBe(false);
  });
});
```

**DO NOT Test:**

- **Components (Views)**: Pure UI components with no logic
- **Routes**: Thin wrappers
- **Shared UI components**: Base UI library (already tested)

### Test Quality Guidelines

**✅ DO:**

- Write tests BEFORE implementation (TDD approach)
- Test **behavior and requirements**, not implementation
- Use AAA pattern (Arrange, Act, Assert) for clarity
- Test edge cases, error scenarios, and acceptance criteria
- Use descriptive test names that explain the requirement
- Test errors using code-style identifiers
- Mock external dependencies (repositories, services)
- Each test should verify ONE specific requirement
- Tests should be independent and repeatable
- Always use `beforeEach` to reset mocks

**❌ DON'T:**

- Test implementation details that might change during refactoring
- Write tests just for coverage numbers
- Create tests after implementation
- Share state between tests
- Mock everything (test real behavior when possible)
- Write tests that pass immediately without implementation
- Test library code (React hooks, Zustand internals)
- Test pure UI components with unit tests

## Feature Implementation Workflow (TDD)

### 1. Read User Story

- Review the user story from `Historias de Usuario e Hitos.md`
- **Identify business rules** and acceptance criteria
- **Identify edge cases**
- **List test scenarios** BEFORE coding

Example: **HU-007: Ver sugerencias al abrir la app**

Business rules:

- Show 3-5 suggestions maximum
- Prioritize by urgency (expiring products first)
- Show time estimate (10/20/30 min)
- No infinite scroll

### 2. Locate Relevant Information

- Domain models: `src/domain/<entity>`
- Use case contracts: `src/domain/<entity>/use_cases`
- Use case implementations: `src/application/usecases/<entity>`
- Domain errors: `src/domain/<entity>/errors.ts`
- Repositories: `src/infrastructure/repositories/<entity>`
- Screens: `src/presentation/features/<feature>/screens`
- Components: `src/presentation/features/<feature>/components`
- Routes: `app/<feature>`

### 3. Write Failing Tests FIRST (RED Phase)

**CRITICAL:** Do NOT write any implementation code yet!

- Write tests for domain logic
- Write tests in `__tests__` folder or colocated with files
- Write ONE test for EACH business rule identified in Step 1
- Write tests for ALL edge cases
- Use realistic business scenarios and data
- Follow naming: `should_<BUSINESS_EXPECTATION>_when_<BUSINESS_SCENARIO>`

**Run tests:** `npm test`
**Expected:** ❌ All tests fail (feature not implemented)

### 4. Implement Domain Models (GREEN Phase)

- Update or create domain models, value objects, and errors
- **Write ONLY enough code to make tests pass**
- Keep business logic in the domain layer

**Run tests:** `npm test`
**Goal:** ✅ Tests turn green one by one

### 5. Implement Application Layer (GREEN Phase)

- Define or update use case interfaces
- Implement use cases, **always injecting the logger**
- Write minimal code to satisfy test requirements

**Run tests:** `npm test`
**Expected:** ✅ All tests pass

### 6. Refactor (REFACTOR Phase)

- Improve code quality without changing behavior
- Extract methods, improve naming, reduce duplication
- **Run tests after EVERY refactoring change**

**Run tests:** `npm test`
**Expected:** ✅ Tests still pass

### 7. Infrastructure Layer

- Update or create repository adapters
- Implement AsyncStorage or HTTP adapters
- Write integration tests
- Ensure no business logic leaks into infrastructure

### 8. Presentation Layer

#### Create Feature Hook with DI

```typescript
// features/suggestions/hooks/use-suggestions.ts
import { useState, useEffect } from 'react';
import { useUseCases } from '~/core/providers/use-case-provider';

export function useSuggestions() {
  const { getSuggestions } = useUseCases();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getSuggestions
      .execute(5) // Max 5 suggestions
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [getSuggestions]);

  return { products, loading, error };
}
```

#### Create Presentational Component

```typescript
// features/suggestions/components/suggestions-view.tsx
interface Props {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

export function SuggestionsView({ products, loading, error }: Props) {
  const { t } = useTranslation();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-bold px-4 py-6">{t('suggestions.title')}</Text>
      {products.length === 0 ? (
        <Text className="px-4 text-neutral-600">{t('suggestions.empty')}</Text>
      ) : (
        products.map((product) => <ProductCard key={product.id} product={product} />)
      )}
    </View>
  );
}
```

#### Create Screen Component

```typescript
// features/suggestions/screens/suggestions-screen.tsx
export function SuggestionsScreen() {
  const { products, loading, error } = useSuggestions();

  return <SuggestionsView products={products} loading={loading} error={error} />;
}
```

#### Create Route

```typescript
// app/index.tsx
import { SuggestionsScreen } from '~/features/suggestions/screens/suggestions-screen';

export default function HomeRoute() {
  return <SuggestionsScreen />;
}
```

### 9. i18n

- Add translation keys to BOTH `en.json` and `es.json`
- Use code-style identifiers
- Follow brand voice guidelines (calm, clear, complicit)

### 10. Final Check

- ✅ Verify ALL tests pass: `npm test`
- ✅ Check formatting: `npm run format`
- ✅ Run linter: `npm run lint`
- ✅ Run type check: `npm run typecheck`
- ✅ Verify business rules are validated by tests
- ✅ Verify brand voice is respected in all copy

## Code Quality Standards

### TypeScript

- Use strict mode
- No `any` types (use `unknown` if needed)
- Prefer interfaces for public APIs
- Use `type` for unions and intersections

### React Native Patterns

- Functional components only
- Use hooks for state and effects
- Memoize expensive computations
- Use `useMemo` and `useCallback` wisely

### Styling

- Use NativeWind (Tailwind) classes
- Follow brand colors (neutral base, calm accents)
- Use `cn()` utility for conditional classes
- Keep UI calm and simple (see Brand Voice)

### Performance

- Lazy load routes when possible
- Optimize images
- Avoid unnecessary re-renders
- Use `React.memo` for expensive components

## Common Commands

```bash
npm run dev              # Start development server
npm run android          # Run on Android
npm run ios              # Run on iOS (Mac only)
npm run web              # Run on web

npm test                 # Run tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Tests with coverage

npm run typecheck        # TypeScript validation
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier check
npm run format:fix       # Prettier auto-format
```

## Common Mistakes to Avoid

1. ❌ **Importing repositories directly in presentation**
   - Use `useUseCases()` hook instead

2. ❌ **Business logic in infrastructure or presentation**
   - Keep it in domain/application

3. ❌ **Hardcoded strings**
   - Use i18n keys

4. ❌ **Deep relative imports** (`../../../`)
   - Use path aliases (`~/*`, `@domain/*`)

5. ❌ **Using `useUseCases()` in components**
   - Only screens can use DI, components get data via props

6. ❌ **Skipping tests**
   - Write tests FIRST (TDD)

7. ❌ **Domain depending on infrastructure**
   - Domain must be pure

8. ❌ **Shared components depending on features**
   - Keep shared components generic

9. ❌ **Adding complexity or "smart" features**
   - Remember: less is more, reduce mental load

10. ❌ **Using alarming or moralistic copy**
    - Follow brand voice: calm, clear, complicit

## Product-Specific Guidelines

### The "Star Screen" Rule

The **"What can I eat now?"** screen is the star of the product. Everything else serves this screen.

**Success criteria:** User decides what to eat in **less than 10 seconds**.

If you're implementing a feature that doesn't directly help achieve this goal, question if it's needed.

### The "Calm" Test

Before adding any UI element, ask:

- Does this blink, glow, or draw excessive attention? ❌ Remove it
- Does this add cognitive load? ❌ Remove it
- Does this guilt-trip the user? ❌ Remove it
- Does this require precision the user doesn't have? ❌ Make it optional

### Copy Guidelines

When writing user-facing text:

- Short sentences
- Everyday language
- Zero jargon
- No "optimize", "manage", "sustainability"
- Human tone, not nutritionist

Examples:

- ✅ "Use this today" ❌ "Optimize consumption"
- ✅ "Avoid wasting food" ❌ "Reduce food waste"
- ✅ "Decide what to eat today" ❌ "Plan your meals"
- ✅ "I wouldn't trust it" ❌ "Product expired 3 days ago"

## Summary Checklist

When implementing a feature, ensure:

- [ ] Tests written FIRST (TDD)
- [ ] Follows product philosophy (reduce mental load)
- [ ] Domain models are pure (no dependencies)
- [ ] Use cases implement interfaces from domain
- [ ] Infrastructure uses repository interfaces
- [ ] Screens use DI via `useUseCases()`
- [ ] Components are pure (data from props)
- [ ] i18n keys in both `en.json` and `es.json`
- [ ] Copy follows brand voice (calm, clear, complicit)
- [ ] UI is simple and calm (no unnecessary noise)
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Code is formatted (`npm run format:fix`)
- [ ] ESLint passes (`npm run lint`)

---

**Follow these guidelines strictly to maintain architectural integrity, code quality, and product philosophy.**
