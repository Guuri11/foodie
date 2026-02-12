import type { Product } from '../model';

export interface GetAllProductsUseCase {
  execute(): Promise<Product[]>;
}
