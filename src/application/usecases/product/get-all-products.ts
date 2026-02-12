import type { Logger } from '@domain/logger';
import type { ProductRepository } from '@domain/product/repository';
import type {
  GetAllProductsResult,
  GetAllProductsUseCase,
} from '@domain/product/use-cases/get-all-products';

export class GetAllProductsUseCaseImpl implements GetAllProductsUseCase {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(): Promise<GetAllProductsResult> {
    this.logger.info('Getting all active products');
    const [active, all] = await Promise.all([
      this.repository.getActiveProducts(),
      this.repository.getAll(),
    ]);
    return { active, totalCount: all.length };
  }
}
