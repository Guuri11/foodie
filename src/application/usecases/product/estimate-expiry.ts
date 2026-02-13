import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { type Product, updateProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { ExpiryEstimatorService } from '@domain/product/services/expiry-estimator';
import type { EstimateExpiryUseCase } from '@domain/product/use-cases/estimate-expiry';

/**
 * Implementation of EstimateExpiryUseCase (H2.3).
 *
 * Estimates and updates a product's expiry date using ExpiryEstimatorService.
 * Fails gracefully if estimation is unavailable.
 */
export class EstimateExpiryUseCaseImpl implements EstimateExpiryUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly estimator: ExpiryEstimatorService,
    private readonly logger: Logger
  ) {}

  async execute(id: string): Promise<Product> {
    this.logger.info('Estimating product expiry', { id });

    const existing = await this.repository.getById(id);
    if (!existing) {
      throw ProductError.notFound(id);
    }

    let estimatedExpiryDate: Date | null = null;

    try {
      // Call estimator service with product details
      const estimation = await this.estimator.estimateExpiryDate(
        existing.name,
        existing.status,
        existing.location
      );

      estimatedExpiryDate = estimation.date;

      this.logger.info('Expiry estimated', {
        id,
        confidence: estimation.confidence,
        hasDate: estimation.date !== null,
      });
    } catch (error) {
      // Fail gracefully - set estimated expiry to null
      this.logger.error('Expiry estimation failed', { id, error });
      estimatedExpiryDate = null;
    }

    // Update product with estimated expiry (never override manual expiryDate)
    // Convert null to undefined for TypeScript compatibility
    const updated = updateProduct(existing, {
      estimatedExpiryDate: estimatedExpiryDate ?? undefined,
    });
    await this.repository.save(updated);
    return updated;
  }
}
