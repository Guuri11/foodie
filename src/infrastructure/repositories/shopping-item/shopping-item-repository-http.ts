import type { ShoppingItem } from '@domain/shopping-item/model';
import type { ShoppingItemRepository } from '@domain/shopping-item/repository';

interface ShoppingItemResponseDTO {
  id: string;
  name: string;
  product_id?: string;
  is_bought: boolean;
  created_at: string;
  updated_at: string;
}

interface ClearBoughtResponseDTO {
  count: number;
}

function fromApiResponse(dto: ShoppingItemResponseDTO): ShoppingItem {
  return {
    id: dto.id,
    name: dto.name,
    productId: dto.product_id ?? undefined,
    isBought: dto.is_bought,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export class ShoppingItemRepositoryHttp implements ShoppingItemRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly fetch: typeof globalThis.fetch = globalThis.fetch
  ) {}

  async getAll(): Promise<ShoppingItem[]> {
    const response = await this.fetch(`${this.baseUrl}/shopping-items`);
    if (!response.ok) {
      throw new Error(`Failed to fetch shopping items: ${response.status}`);
    }
    const dtos: ShoppingItemResponseDTO[] = await response.json();
    return dtos.map(fromApiResponse);
  }

  async save(item: ShoppingItem): Promise<ShoppingItem> {
    const response = await this.fetch(`${this.baseUrl}/shopping-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        product_id: item.productId ?? null,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create shopping item: ${response.status}`);
    }
    const dto: ShoppingItemResponseDTO = await response.json();
    return fromApiResponse(dto);
  }

  async update(id: string, changes: { name?: string; isBought?: boolean }): Promise<ShoppingItem> {
    const response = await this.fetch(`${this.baseUrl}/shopping-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: changes.name ?? null,
        is_bought: changes.isBought ?? null,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update shopping item: ${response.status}`);
    }
    const dto: ShoppingItemResponseDTO = await response.json();
    return fromApiResponse(dto);
  }

  async delete(id: string): Promise<void> {
    const response = await this.fetch(`${this.baseUrl}/shopping-items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete shopping item: ${response.status}`);
    }
  }

  async clearBought(): Promise<number> {
    const response = await this.fetch(`${this.baseUrl}/shopping-items/bought`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to clear bought items: ${response.status}`);
    }
    const dto: ClearBoughtResponseDTO = await response.json();
    return dto.count;
  }
}
