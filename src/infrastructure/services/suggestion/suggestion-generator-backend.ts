import type { Product } from '@domain/product/model';
import { SuggestionError } from '@domain/suggestion/errors';
import {
  createSuggestion,
  type Suggestion,
  type SuggestionIngredient,
  type TimeRange,
} from '@domain/suggestion/model';
import type { SuggestionGeneratorService } from '@domain/suggestion/services/suggestion-generator';

interface SuggestionApiResponse {
  id: string;
  title: string;
  description?: string;
  estimated_time: TimeRange;
  ingredients: Array<{
    product_id: string;
    product_name: string;
    quantity?: string;
    is_urgent: boolean;
  }>;
  urgent_ingredients: string[];
  steps?: string[];
  created_at: string;
}

/**
 * Backend-based suggestion generator.
 *
 * Delegates suggestion generation to the Rust backend, which calls OpenAI internally.
 * The mobile app does not need an OpenAI API key.
 *
 * Note: The `products` parameter is not sent to the backend because the backend
 * fetches active products from the database directly.
 */
export class SuggestionGeneratorBackend implements SuggestionGeneratorService {
  constructor(private readonly apiBaseUrl: string) {}

  async generate(_products: Product[], limit: number): Promise<Suggestion[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/suggestions?limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw SuggestionError.GenerationFailed(`Backend API error ${response.status}`);
      }

      const data = (await response.json()) as SuggestionApiResponse[];

      return data.map((item, index) => {
        const ingredients: SuggestionIngredient[] = item.ingredients.map((ing) => ({
          productId: ing.product_id,
          productName: ing.product_name,
          quantity: ing.quantity,
          isUrgent: ing.is_urgent,
        }));

        return createSuggestion({
          id: item.id || `backend-${Date.now()}-${index}`,
          title: item.title,
          description: item.description,
          estimatedTime: item.estimated_time,
          ingredients,
          steps: item.steps,
        });
      });
    } catch (error) {
      if (error instanceof SuggestionError) {
        throw error;
      }
      throw SuggestionError.GenerationFailed(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
