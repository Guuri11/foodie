import type { CreatePurchaseParams } from '../model';

export interface CreatePurchaseUseCase {
  execute(params: CreatePurchaseParams): Promise<void>;
}
