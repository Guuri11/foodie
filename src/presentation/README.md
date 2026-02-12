# Presentation Layer

This layer contains the **UI** and user interaction logic. It follows a modular structure inspired by Feature-Sliced Design.

## Structure

```
presentation/
  core/                 # Cross-cutting concerns
    providers/          # Dependency Injection
    hooks/              # Generic hooks
    utils/              # Utilities (cn, etc.)

  shared/               # Shared UI components (NO feature dependencies)
    ui/                 # React Native Reusables components
    components/         # Domain-agnostic reusable components
    layout/             # Layout components

  features/             # Feature modules organized by domain
    <feature>/
      components/       # Feature-specific components
      hooks/            # Feature hooks with DI
      stores/           # Feature state (Zustand)
      screens/          # Screen components

  lib/                  # Application-specific logic
    stores/             # Global stores
    locales/            # i18n files

  routes/               # Expo Router routes
  assets/               # Static assets
```

## Rules

- **NO business logic**: Only UI and user interaction
- **Dependency Injection**: Use hooks to access use cases
- **Feature Independence**: Features should not depend on each other
- **Shared Components**: Must be generic with no feature-specific dependencies
- **i18n**: All user-facing text must use translation keys

## Path Aliases

```typescript
~/*                 // src/presentation/*
~/core/*            // src/presentation/core/*
~/shared/*          // src/presentation/shared/*
~/features/*        // src/presentation/features/*
@domain/*           // src/domain/*
@infrastructure/*   // src/infrastructure/*
@application/*      // src/application/*
```

## Example

```typescript
// features/driver/hooks/use-driver.ts
import { useState, useEffect } from 'react';
import { useUseCases } from '~/core/providers/use-case-provider';

export function useDriver(id: string) {
  const { getDriver } = useUseCases();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDriver
      .execute(id)
      .then(setDriver)
      .finally(() => setLoading(false));
  }, [id, getDriver]);

  return { driver, loading };
}
```
