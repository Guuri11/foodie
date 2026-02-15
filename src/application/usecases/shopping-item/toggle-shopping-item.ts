import type { Logger } from '@domain/logger';
import type { ShoppingItem } from '@domain/shopping-item/model';
import type { ShoppingItemRepository } from '@domain/shopping-item/repository';
import type { ToggleShoppingItemUseCase } from '@domain/shopping-item/use-cases/toggle-shopping-item';

export class ToggleShoppingItemUseCaseImpl implements ToggleShoppingItemUseCase {
  constructor(
    private readonly repository: ShoppingItemRepository,
    private readonly logger: Logger
  ) {}

  async execute(id: string, isBought: boolean): Promise<ShoppingItem> {
    this.logger.info('Toggling shopping item', { id, isBought });
    return this.repository.update(id, { isBought });
  }
}
