import type { Product } from '../model';
import type { ProductLocation } from '../value-objects';

export interface AddProductUseCase {
  execute(
    name: string,
    options?: { location?: ProductLocation; quantity?: string }
  ): Promise<Product>;
}
