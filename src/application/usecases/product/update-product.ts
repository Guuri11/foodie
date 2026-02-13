import type { Logger } from '@domain/logger';
import { type Product, type ProductUpdate, updateProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { UpdateProductUseCase } from '@domain/product/use-cases/update-product';

import { ProductError } from '@domain/product/errors';

export class UpdateProductUseCaseImpl implements UpdateProductUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(id: string, changes: ProductUpdate): Promise<Product> {
    this.logger.info('Updating product', { id });

    const existing = await this.repository.getById(id);
    if (!existing) {
      throw ProductError.notFound(id);
    }

    const updated = updateProduct(existing, changes);
    await this.repository.save(updated);
    return updated;
  }
}
