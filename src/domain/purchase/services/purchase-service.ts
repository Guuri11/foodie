import type { CreatePurchaseParams } from '../model';

export interface PurchaseService {
  create(params: CreatePurchaseParams): Promise<void>;
}
