import { isActive, type Product } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';

import seedData from './seed-data.json';

interface SeedEntry {
  id: string;
  name: string;
  status: string;
  location?: string;
  quantity?: string;
  outcome?: string;
  daysUntilExpiry?: number;
}

function buildProduct(entry: SeedEntry): Product {
  const now = new Date();
  let expiryDate: Date | undefined;

  if (entry.daysUntilExpiry !== undefined) {
    expiryDate = new Date(now.getTime() + entry.daysUntilExpiry * 24 * 60 * 60 * 1000);
  }

  return {
    id: entry.id,
    name: entry.name,
    status: entry.status as Product['status'],
    location: entry.location as Product['location'],
    quantity: entry.quantity,
    expiryDate,
    outcome: entry.outcome as Product['outcome'],
    createdAt: now,
    updatedAt: now,
  };
}

export class ProductRepositoryMemory implements ProductRepository {
  private products: Map<string, Product>;

  constructor() {
    this.products = new Map();
    for (const entry of seedData as SeedEntry[]) {
      const product = buildProduct(entry);
      this.products.set(product.id, product);
    }
  }

  async getAll(): Promise<Product[]> {
    return [...this.products.values()];
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }

  async getActiveProducts(): Promise<Product[]> {
    return [...this.products.values()].filter(isActive);
  }
}
