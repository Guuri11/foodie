import type { Logger } from '@domain/logger';
import { ShoppingItemError } from '@domain/shopping-item/errors';
import type { ShoppingItem } from '@domain/shopping-item/model';
import type { ShoppingItemRepository } from '@domain/shopping-item/repository';
import type { AddShoppingItemUseCase } from '@domain/shopping-item/use-cases/add-shopping-item';

export class AddShoppingItemUseCaseImpl implements AddShoppingItemUseCase {
  constructor(
    private readonly repository: ShoppingItemRepository,
    private readonly logger: Logger
  ) {}

  async execute(name: string, productId?: string): Promise<ShoppingItem> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw ShoppingItemError.nameEmpty();
    }

    this.logger.info('Adding shopping item', { name: trimmedName, productId });

    return this.repository.save({
      id: '',
      name: trimmedName,
      productId,
      isBought: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
