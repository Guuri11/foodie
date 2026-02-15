/**
 * Suggestion Generator Stub
 * 
 * Local algorithm-based suggestion generator.
 * Used as fallback when AI service is unavailable or no API key configured.
 * 
 * Strategy:
 * - Match products against predefined recipe templates
 * - Prioritize recipes using urgent (expiring) ingredients
 * - Keep it simple and functional
 */

import type { Product } from '@domain/product/model';
import { isExpired, isExpiringSoon } from '@domain/product/model';
import {
  createSuggestion,
  type Suggestion,
  type SuggestionIngredient,
  type TimeRange,
} from '@domain/suggestion/model';
import type { SuggestionGeneratorService } from '@domain/suggestion/services/suggestion-generator';

interface RecipeTemplate {
  name: string;
  patterns: string[][]; // Multiple ingredient combinations that work
  timeRange: TimeRange;
  steps: string[];
}

/**
 * Predefined recipe templates with common Spanish dishes
 */
const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    name: 'Arroz con pollo',
    patterns: [
      ['chicken', 'rice'],
      ['pollo', 'arroz'],
    ],
    timeRange: 'medium',
    steps: ['Cocina el pollo', 'Hierve el arroz', 'Mezcla todo'],
  },
  {
    name: 'Pasta con tomate',
    patterns: [
      ['pasta', 'tomato'],
      ['pasta', 'tomate'],
      ['spaghetti', 'tomato'],
    ],
    timeRange: 'quick',
    steps: ['Hierve la pasta', 'Calienta la salsa', 'Mezcla'],
  },
  {
    name: 'Tortilla de patatas',
    patterns: [
      ['eggs', 'potato'],
      ['huevos', 'patata'],
    ],
    timeRange: 'medium',
    steps: ['Fríe las patatas', 'Bate los huevos', 'Cocina la tortilla'],
  },
  {
    name: 'Ensalada de pollo',
    patterns: [
      ['chicken', 'lettuce'],
      ['pollo', 'lechuga'],
    ],
    timeRange: 'quick',
    steps: ['Cocina el pollo', 'Corta la lechuga', 'Mezcla con aliño'],
  },
  {
    name: 'Sopa de verduras',
    patterns: [
      ['carrot', 'onion'],
      ['zanahoria', 'cebolla'],
      ['vegetables', 'broth'],
    ],
    timeRange: 'medium',
    steps: ['Corta las verduras', 'Hierve con caldo', 'Cocina 20 min'],
  },
  {
    name: 'Huevos revueltos',
    patterns: [['eggs'], ['huevos']],
    timeRange: 'quick',
    steps: ['Bate los huevos', 'Cocina a fuego medio', 'Remueve constantemente'],
  },
  {
    name: 'Arroz blanco',
    patterns: [['rice'], ['arroz']],
    timeRange: 'quick',
    steps: ['Hierve agua', 'Añade arroz', 'Cocina 15 min'],
  },
  {
    name: 'Pasta al aglio e olio',
    patterns: [
      ['pasta', 'garlic', 'olive oil'],
      ['pasta', 'ajo', 'aceite'],
    ],
    timeRange: 'quick',
    steps: ['Hierve la pasta', 'Fríe el ajo', 'Mezcla con aceite'],
  },
  {
    name: 'Pollo al horno',
    patterns: [['chicken'], ['pollo']],
    timeRange: 'long',
    steps: ['Sazona el pollo', 'Precalienta el horno', 'Hornea 30-40 min'],
  },
  {
    name: 'Sándwich',
    patterns: [
      ['bread', 'cheese'],
      ['pan', 'queso'],
      ['bread', 'ham'],
    ],
    timeRange: 'quick',
    steps: ['Pon los ingredientes en el pan', 'Opcional: tuéstalo'],
  },
];

export class SuggestionGeneratorStub implements SuggestionGeneratorService {
  async generate(products: Product[], limit: number): Promise<Suggestion[]> {
    // Filter out expired products (shouldn't suggest using them)
    const usableProducts = products.filter((p) => !isExpired(p));

    if (usableProducts.length === 0) {
      return [];
    }

    // Find matching recipes
    const matches = this.findMatchingRecipes(usableProducts);

    // Sort by urgency (recipes using expiring products first)
    const sorted = this.sortByUrgency(matches);

    // Limit results
    return sorted.slice(0, limit);
  }

  private findMatchingRecipes(
    products: Product[]
  ): Array<{ template: RecipeTemplate; matchedProducts: Product[] }> {
    const matches: Array<{
      template: RecipeTemplate;
      matchedProducts: Product[];
    }> = [];

    for (const template of RECIPE_TEMPLATES) {
      for (const pattern of template.patterns) {
        const matchedProducts = this.matchPattern(pattern, products);

        if (matchedProducts.length > 0) {
          matches.push({ template, matchedProducts });
          break; // One pattern match per template is enough
        }
      }
    }

    return matches;
  }

  private matchPattern(pattern: string[], products: Product[]): Product[] {
    const matched: Product[] = [];

    for (const keyword of pattern) {
      const product = products.find((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );

      if (product) {
        matched.push(product);
      }
    }

    // All keywords must match for pattern to be valid
    return matched.length === pattern.length ? matched : [];
  }

  private sortByUrgency(
    matches: Array<{ template: RecipeTemplate; matchedProducts: Product[] }>
  ): Suggestion[] {
    return matches
      .map(({ template, matchedProducts }) => {
        // Create suggestion with urgency info
        const ingredients: SuggestionIngredient[] = matchedProducts.map(
          (product) => ({
            productId: product.id,
            productName: product.name,
            quantity: product.quantity,
            isUrgent: isExpiringSoon(product),
          })
        );

        const urgentCount = ingredients.filter((ing) => ing.isUrgent).length;

        return {
          suggestion: createSuggestion({
            id: `stub-${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            title: template.name,
            description: `Con ${matchedProducts.map((p) => p.name).join(', ')}`,
            estimatedTime: template.timeRange,
            ingredients,
            steps: template.steps,
          }),
          urgentCount,
        };
      })
      .sort((a, b) => b.urgentCount - a.urgentCount) // Most urgent first
      .map(({ suggestion }) => suggestion);
  }
}
