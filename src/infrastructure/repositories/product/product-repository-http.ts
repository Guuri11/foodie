import type { Product } from '@domain/product/model';
import type { CreateProductParams, ProductRepository } from '@domain/product/repository';
import type { ProductStatus } from '@domain/product/value-objects';

interface ProductResponseDTO {
  id: string;
  name: string;
  status: ProductStatus;
  location?: string;
  quantity?: string;
  expiry_date?: string;
  estimated_expiry_date?: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
}

function fromApiResponse(dto: ProductResponseDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    location: dto.location as Product['location'],
    quantity: dto.quantity,
    expiryDate: dto.expiry_date ? new Date(dto.expiry_date) : undefined,
    estimatedExpiryDate: dto.estimated_expiry_date
      ? new Date(dto.estimated_expiry_date)
      : undefined,
    outcome: dto.outcome as Product['outcome'],
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

function toApiRequest(product: Product) {
  return {
    name: product.name,
    status: product.status,
    location: product.location ?? null,
    quantity: product.quantity ?? null,
    expiry_date: product.expiryDate?.toISOString() ?? null,
    estimated_expiry_date: product.estimatedExpiryDate?.toISOString() ?? null,
    outcome: product.outcome ?? null,
  };
}

export class ProductRepositoryHttp implements ProductRepository {
  constructor(private readonly baseUrl: string) {}

  async getAll(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const dtos: ProductResponseDTO[] = await response.json();
    return dtos.map(fromApiResponse);
  }

  async getById(id: string): Promise<Product | null> {
    const response = await fetch(`${this.baseUrl}/products/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    const dto: ProductResponseDTO = await response.json();
    return fromApiResponse(dto);
  }

  async create(params: CreateProductParams): Promise<Product> {
    const body = {
      name: params.name,
      status: 'new' as const,
      location: params.location ?? null,
      quantity: params.quantity ?? null,
    };

    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.status}`);
    }

    const dto: ProductResponseDTO = await response.json();
    return fromApiResponse(dto);
  }

  async save(product: Product): Promise<void> {
    const body = toApiRequest(product);

    const response = await fetch(`${this.baseUrl}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status}`);
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
  }

  async getActiveProducts(): Promise<Product[]> {
    // The backend GET /products already returns only active products
    return this.getAll();
  }
}
