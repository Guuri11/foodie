import type { Logger } from '@domain/logger';
import type { Product } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { GetAllProductsUseCase } from '@domain/product/use-cases/get-all-products';

export class GetAllProductsUseCaseImpl implements GetAllProductsUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(): Promise<Product[]> {
    this.logger.info('Getting all active products');
    return this.repository.getActiveProducts();
  }
}
