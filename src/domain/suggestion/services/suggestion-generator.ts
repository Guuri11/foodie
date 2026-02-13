/**
 * Suggestion Generator Service Interface
 * 
 * Contract for services that generate cooking suggestions from products.
 * This is implemented in the infrastructure layer (OpenAI, Stub, etc).
 */

import type { Product } from '@domain/product/model';
import type { Suggestion } from '@domain/suggestion/model';

export interface SuggestionGeneratorService {
  /**
   * Generate cooking suggestions from available products
   * 
   * @param products Array of products from user's pantry (should be sorted by urgency)
   * @param limit Maximum number of suggestions to generate
   * @returns Array of suggestions
   * @throws SuggestionError if generation fails
   */
  generate(products: Product[], limit: number): Promise<Suggestion[]>;
}
