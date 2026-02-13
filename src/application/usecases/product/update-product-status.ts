import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { type Product, updateProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { EstimateExpiryUseCase } from '@domain/product/use-cases/estimate-expiry';
import type { UpdateProductStatusUseCase } from '@domain/product/use-cases/update-product-status';
import type { ProductStatus } from '@domain/product/value-objects';

/**
 * Implementation of UpdateProductStatusUseCase (H2.1).
 *
 * Updates a product's lifecycle status. All status transitions are allowed.
 * Automatically re-estimates expiry date when status changes (H2.3).
 */
export class UpdateProductStatusUseCaseImpl implements UpdateProductStatusUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger,
    private readonly estimateExpiry: EstimateExpiryUseCase
  ) {}

  async execute(id: string, status: ProductStatus): Promise<Product> {
    this.logger.info('Updating product status', { id, status });

    const existing = await this.repository.getById(id);
    if (!existing) {
      throw ProductError.notFound(id);
    }

    const updated = updateProduct(existing, { status });
    await this.repository.save(updated);

    // Automatically re-estimate expiry after status change (H2.3)
    // Fail gracefully - don't block status update if estimation fails
    try {
      await this.estimateExpiry.execute(id);
    } catch (error) {
      this.logger.warn('Automatic expiry re-estimation failed', { productId: id, error });
    }

    return updated;
  }
}
