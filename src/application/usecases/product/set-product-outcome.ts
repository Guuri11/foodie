import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { type Product, updateProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { SetProductOutcomeUseCase } from '@domain/product/use-cases/set-product-outcome';
import type { ProductOutcome } from '@domain/product/value-objects';

/**
 * Implementation of SetProductOutcomeUseCase (H2.5).
 *
 * Sets the outcome for a finished product (used or thrown away).
 * Business rule: Outcome can only be SET when status is 'finished',
 * but can be CLEARED regardless of status.
 */
export class SetProductOutcomeUseCaseImpl implements SetProductOutcomeUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(id: string, outcome: ProductOutcome | null): Promise<Product> {
    this.logger.info('Setting product outcome', { id, outcome });

    const existing = await this.repository.getById(id);
    if (!existing) {
      throw ProductError.notFound(id);
    }

    // Business rule: outcome can only be SET when status is 'finished'
    // But clearing (null) is always allowed
    if (outcome !== null && existing.status !== 'finished') {
      throw ProductError.outcomeRequiresFinishedStatus();
    }

    // Convert null to undefined for TypeScript compatibility
    const updated = updateProduct(existing, { outcome: outcome ?? undefined });
    await this.repository.save(updated);
    return updated;
  }
}
