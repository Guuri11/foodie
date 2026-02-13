import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { type Product, type ProductUpdate, updateProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { EstimateExpiryUseCase } from '@domain/product/use-cases/estimate-expiry';
import type { UpdateProductUseCase } from '@domain/product/use-cases/update-product';

export class UpdateProductUseCaseImpl implements UpdateProductUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger,
    private readonly estimateExpiry: EstimateExpiryUseCase
  ) {}

  async execute(id: string, changes: ProductUpdate): Promise<Product> {
    this.logger.info('Updating product', { id });

    const existing = await this.repository.getById(id);
    if (!existing) {
      throw ProductError.notFound(id);
    }

    const updated = updateProduct(existing, changes);
    await this.repository.save(updated);

    // Automatically re-estimate expiry when location changes (H2.3)
    // Only if no manual expiry date is being set in this update
    const locationChanged =
      changes.location !== undefined && changes.location !== existing.location;
    const manualExpiryProvided = changes.expiryDate !== undefined;

    if (locationChanged && !manualExpiryProvided) {
      try {
        await this.estimateExpiry.execute(id);
      } catch (error) {
        this.logger.warn('Automatic expiry re-estimation failed', { productId: id, error });
      }
    }

    return updated;
  }
}
