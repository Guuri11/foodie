import type { Logger } from '@domain/logger';
import type { ShoppingItem } from '@domain/shopping-item/model';
import type { ShoppingItemRepository } from '@domain/shopping-item/repository';
import type { GetShoppingItemsUseCase } from '@domain/shopping-item/use-cases/get-shopping-items';

export class GetShoppingItemsUseCaseImpl implements GetShoppingItemsUseCase {
  constructor(
    private readonly repository: ShoppingItemRepository,
    private readonly logger: Logger
  ) {}

  async execute(): Promise<ShoppingItem[]> {
    this.logger.info('Getting all shopping items');
    return this.repository.getAll();
  }
}
