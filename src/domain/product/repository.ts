import type { Product } from './model';

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  getActiveProducts(): Promise<Product[]>;
}
