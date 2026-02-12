import type { Product } from '../model';

export interface GetAllProductsResult {
  active: Product[];
  totalCount: number;
}

export interface GetAllProductsUseCase {
  execute(): Promise<GetAllProductsResult>;
}
