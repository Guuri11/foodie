import type { Logger } from '@domain/logger';
import type { ShoppingItemRepository } from '@domain/shopping-item/repository';
import type { ClearBoughtItemsUseCase } from '@domain/shopping-item/use-cases/clear-bought-items';

export class ClearBoughtItemsUseCaseImpl implements ClearBoughtItemsUseCase {
  constructor(
    private readonly repository: ShoppingItemRepository,
    private readonly logger: Logger
  ) {}

  async execute(): Promise<number> {
    this.logger.info('Clearing bought shopping items');
    const count = await this.repository.clearBought();
    this.logger.info('Cleared bought items', { count });
    return count;
  }
}
