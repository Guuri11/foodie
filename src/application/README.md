# Application Layer

This layer contains **use case implementations** that orchestrate domain logic. It depends on domain abstractions but NOT on concrete implementations.

## Structure

```
application/
  usecases/
    <entity>/
      <use-case-name>.ts    # Use case implementation
```

## Rules

- **Implements use case interfaces** from domain layer
- **Orchestrates domain logic**: Uses domain models and repositories
- **Dependency Injection**: Receives dependencies via constructor
- **NO UI logic**: No React components or hooks
- **NO direct infrastructure**: Uses repository interfaces, not implementations

## Example

```typescript
// application/usecases/driver/get-driver.ts
import type { GetDriverUseCase } from '@domain/driver/use_cases/get-driver';
import type { DriverRepository } from '@domain/driver/repository';

export class GetDriverUseCaseImpl implements GetDriverUseCase {
  constructor(
    private readonly repository: DriverRepository,
    private readonly logger: Logger
  ) {}

  async execute(id: string): Promise<Driver> {
    this.logger.info('Getting driver', { id });
    return await this.repository.getById(id);
  }
}
```
