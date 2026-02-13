/**
 * GetSuggestionsUseCase Implementation
 * 
 * Orchestrates the process of generating cooking suggestions:
 * 1. Fetch active products from pantry
 * 2. Sort by urgency (expiring products first)
 * 3. Generate suggestions via AI or algorithm
 * 4. Limit to max 5 suggestions
 * 
 * Part of Milestone 3: H3.1, H3.2, H3.3, H3.4
 */

import type { Logger } from '@domain/logger';
import { sortByUrgency } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { Suggestion } from '@domain/suggestion/model';
import type { SuggestionGeneratorService } from '@domain/suggestion/services/suggestion-generator';
import type { GetSuggestionsUseCase } from '@domain/suggestion/use-cases/get-suggestions';

export class GetSuggestionsUseCaseImpl implements GetSuggestionsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly suggestionGenerator: SuggestionGeneratorService,
    private readonly logger: Logger
  ) {}

  async execute(limit: number = 5): Promise<Suggestion[]> {
    this.logger.info('Getting suggestions', { limit });

    // Fetch active products (exclude finished ones)
    const products = await this.productRepository.getActiveProducts();

    // Business rule: need at least 2 products to generate suggestions
    if (products.length < 2) {
      this.logger.info('Not enough products for suggestions', {
        count: products.length,
      });
      return [];
    }

    // Sort products by urgency (expiring first) - H3.2
    const sortedProducts = sortByUrgency(products);

    // Generate suggestions via service (AI or algorithm)
    const suggestions = await this.suggestionGenerator.generate(
      sortedProducts,
      limit
    );

    // Business rule: return max 3-5 suggestions - H3.1
    return suggestions.slice(0, limit);
  }
}
