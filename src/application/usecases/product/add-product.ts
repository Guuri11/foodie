import { v4 as uuidv4 } from 'uuid';

import type { Logger } from '@domain/logger';
import { createProduct, type Product } from '@domain/product/model';
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
    this.logger.info('Adding product', { name: name.trim() });

    const product = createProduct({
      id: uuidv4(),
      name,
      location: options?.location,
      quantity: options?.quantity,
    });

    await this.repository.save(product);
    return product;
  }
}
