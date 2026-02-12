import type { Product } from '../model';

export interface AddProductUseCase {
  execute(name: string): Promise<Product>;
}
