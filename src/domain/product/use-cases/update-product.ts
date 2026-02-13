import type { Product, ProductUpdate } from '../model';

export interface UpdateProductUseCase {
  execute(id: string, changes: ProductUpdate): Promise<Product>;
}
