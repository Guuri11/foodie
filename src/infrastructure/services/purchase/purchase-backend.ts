import type { CreatePurchaseParams } from '@domain/purchase/model';
import type { PurchaseService } from '@domain/purchase/services/purchase-service';

interface CreatePurchaseApiRequest {
  store_name?: string;
  total_amount?: number;
  items: Array<{
    product_name: string;
    price?: number;
  }>;
}

/**
 * Backend-based purchase service.
 *
 * Records a purchase by calling POST /purchases on the Rust backend.
 */
export class PurchaseBackend implements PurchaseService {
  constructor(
    private readonly apiBaseUrl: string,
    private readonly fetch: typeof globalThis.fetch = globalThis.fetch
  ) {}

  async create(params: CreatePurchaseParams): Promise<void> {
    const body: CreatePurchaseApiRequest = {
      store_name: params.storeName,
      total_amount: params.totalAmount,
      items: params.items.map((item) => ({
        product_name: item.productName,
        price: item.price,
      })),
    };

    const response = await this.fetch(`${this.apiBaseUrl}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backend API error ${response.status}: ${errorBody}`);
    }
  }
}
