import type { Logger } from '@domain/logger';
import type { CreatePurchaseParams } from '@domain/purchase/model';
import type { PurchaseService } from '@domain/purchase/services/purchase-service';
import type { CreatePurchaseUseCase } from '@domain/purchase/use-cases/create-purchase';

export class CreatePurchaseUseCaseImpl implements CreatePurchaseUseCase {
  constructor(
    private readonly service: PurchaseService,
    private readonly logger: Logger
  ) {}

  async execute(params: CreatePurchaseParams): Promise<void> {
    this.logger.info('Creating purchase record', {
      storeName: params.storeName,
      itemCount: params.items.length,
    });

    await this.service.create(params);

    this.logger.info('Purchase record created');
  }
}
