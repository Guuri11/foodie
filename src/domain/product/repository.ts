import type { Product } from './model';
import type { ProductLocation } from './value-objects';

export interface CreateProductParams {
  name: string;
  location?: ProductLocation;
  quantity?: string;
}

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(params: CreateProductParams): Promise<Product>;
  save(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  getActiveProducts(): Promise<Product[]>;
}
