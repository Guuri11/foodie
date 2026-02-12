# Infrastructure Layer

This layer contains **adapters** for external systems. It implements repository interfaces defined in the domain layer.

## Structure

```
infrastructure/
  repositories/
    <entity>/
      <repository-name>.ts    # Repository implementation
  services/
    <service-name>.ts         # External service adapters
  logger/
    logger.ts                 # Logger implementation
```

## Rules

- **Implements repository interfaces** from domain
- **Adapters for external systems**: HTTP, storage, APIs
- **NO business logic**: Only technical implementation
- **Maps DTOs to domain models**: Converts API responses to domain entities

## Example

```typescript
// infrastructure/repositories/driver/driver-repository-http.ts
import type { DriverRepository } from '@domain/driver/repository';
import type { Driver } from '@domain/driver/model';

export class DriverRepositoryHttp implements DriverRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getById(id: string): Promise<Driver> {
    const response = await this.httpClient.get(`/drivers/${id}`);
    return this.mapToDriver(response.data);
  }

  private mapToDriver(dto: DriverDTO): Driver {
    return new Driver(dto.id, dto.name, new Email(dto.email));
  }
}
```
