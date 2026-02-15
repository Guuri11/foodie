import type {
  ExpiryEstimation,
  ExpiryEstimatorService,
} from '@domain/product/services/expiry-estimator';
import type { ProductLocation, ProductStatus } from '@domain/product/value-objects';

interface ExpiryEstimationApiResponse {
  date: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Backend-based expiry date estimator.
 *
 * Delegates estimation to the Rust backend, which calls OpenAI internally.
 * The mobile app does not need an OpenAI API key.
 */
export class ExpiryEstimatorBackend implements ExpiryEstimatorService {
  constructor(private readonly apiBaseUrl: string) {}

  async estimateExpiryDate(
    productName: string,
    status: ProductStatus,
    location?: ProductLocation
  ): Promise<ExpiryEstimation> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/products/estimate-expiry-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          status,
          location: location ?? null,
        }),
      });

      if (!response.ok) {
        return { date: null, confidence: 'none' };
      }

      const data = (await response.json()) as ExpiryEstimationApiResponse;

      return {
        date: data.date ? new Date(data.date) : null,
        confidence: data.confidence,
      };
    } catch {
      // Fail gracefully - return "none" confidence with no date
      return { date: null, confidence: 'none' };
    }
  }
}
