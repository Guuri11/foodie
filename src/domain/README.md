# Domain Layer

This layer contains the **core business logic** and domain models. It is the heart of the application and must remain **pure** with no dependencies on infrastructure or presentation.

## Structure

Each domain entity follows this structure:

```
domain/
  <entity>/
    model.ts              # Domain models and business rules
    value_objects.ts      # Value objects and type-safe wrappers
    errors.ts             # Domain-specific errors with code-style identifiers
    repository.ts         # Repository interfaces (contracts/ports)
    use_cases/            # Use case interfaces (contracts only)
```

## Rules

- **NO infrastructure dependencies**: No HTTP, no database, no external services
- **NO presentation dependencies**: No UI, no React components
- **Pure TypeScript**: Only business logic and types
- **Validation**: Business rules are validated here
- **Errors**: Use code-style identifiers (e.g., `invalid_email`, `not_found`)

## Example

```typescript
// domain/driver/model.ts
export class Driver {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: Email // Value object
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name) {
      throw DriverError.ValidationError('name_empty');
    }
  }
}
```
