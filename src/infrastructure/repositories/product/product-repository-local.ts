import AsyncStorage from '@react-native-async-storage/async-storage';

import { isActive, type Product } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';

const STORAGE_KEY = '@foodie:products';

interface ProductDTO {
  id: string;
  name: string;
  status: string;
  location?: string;
  quantity?: string;
  expiryDate?: string;
  estimatedExpiryDate?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

function toDTO(product: Product): ProductDTO {
  return {
    ...product,
    expiryDate: product.expiryDate?.toISOString(),
    estimatedExpiryDate: product.estimatedExpiryDate?.toISOString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function fromDTO(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status as Product['status'],
    location: dto.location as Product['location'],
    quantity: dto.quantity,
    expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
    estimatedExpiryDate: dto.estimatedExpiryDate ? new Date(dto.estimatedExpiryDate) : undefined,
    outcome: dto.outcome as Product['outcome'],
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export class ProductRepositoryLocal implements ProductRepository {
  async getAll(): Promise<Product[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const dtos: ProductDTO[] = JSON.parse(json);
    return dtos.map(fromDTO);
  }

  async getById(id: string): Promise<Product | null> {
    const products = await this.getAll();
    return products.find((p) => p.id === id) ?? null;
  }

  async save(product: Product): Promise<void> {
    const products = await this.getAll();
    const index = products.findIndex((p) => p.id === product.id);

    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products.map(toDTO)));
  }

  async delete(id: string): Promise<void> {
    const products = await this.getAll();
    const filtered = products.filter((p) => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.map(toDTO)));
  }

  async getActiveProducts(): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter(isActive);
  }
}
