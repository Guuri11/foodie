import type { Logger } from '@domain/logger';
import type { ShoppingItemRepository } from '@domain/shopping-item/repository';
import type { DeleteShoppingItemUseCase } from '@domain/shopping-item/use-cases/delete-shopping-item';

export class DeleteShoppingItemUseCaseImpl implements DeleteShoppingItemUseCase {
  constructor(
    private readonly repository: ShoppingItemRepository,
    private readonly logger: Logger
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.info('Deleting shopping item', { id });
    await this.repository.delete(id);
  }
}
