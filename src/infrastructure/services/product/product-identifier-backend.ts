import type {
  ProductIdentification,
  ProductIdentifierService,
} from '@domain/product/services/product-identifier';
import type { ProductLocation } from '@domain/product/value-objects';

interface ProductIdentificationApiResponse {
  name: string;
  confidence: 'high' | 'low';
  method: 'barcode' | 'visual';
  suggested_location?: ProductLocation;
  suggested_quantity?: string;
}

/**
 * Backend-based product identifier.
 *
 * Delegates image identification (OpenAI) and barcode lookup (Open Food Facts)
 * to the Rust backend. The mobile app does not need any API keys.
 */
export class ProductIdentifierBackend implements ProductIdentifierService {
  constructor(
    private readonly apiBaseUrl: string,
    private readonly fetch: typeof globalThis.fetch = globalThis.fetch
  ) {}

  async identifyByImage(imageBase64: string): Promise<ProductIdentification> {
    const response = await this.fetch(`${this.apiBaseUrl}/products/identify/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backend API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as ProductIdentificationApiResponse;
    return this.mapResponse(data);
  }

  async identifyByBarcode(barcode: string): Promise<ProductIdentification> {
    const response = await this.fetch(`${this.apiBaseUrl}/products/identify/barcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backend API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as ProductIdentificationApiResponse;
    return this.mapResponse(data);
  }

  private mapResponse(data: ProductIdentificationApiResponse): ProductIdentification {
    const result: ProductIdentification = {
      name: data.name,
      confidence: data.confidence,
      method: data.method,
    };

    if (data.suggested_location) {
      result.suggestedLocation = data.suggested_location;
    }

    if (data.suggested_quantity) {
      result.suggestedQuantity = data.suggested_quantity;
    }

    return result;
  }
}
