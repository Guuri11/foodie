import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import type { Product } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { AddProductUseCase } from '@domain/product/use-cases/add-product';
import type { ProductLocation } from '@domain/product/value-objects';

export class AddProductUseCaseImpl implements AddProductUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(
    name: string,
    options?: { location?: ProductLocation; quantity?: string }
  ): Promise<Product> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw ProductError.nameEmpty();
    }

    this.logger.info('Adding product', { name: trimmedName });

    return this.repository.create({
      name: trimmedName,
      location: options?.location,
      quantity: options?.quantity,
    });
  }
}
