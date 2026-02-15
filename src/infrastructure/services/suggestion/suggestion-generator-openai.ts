/**
 * Suggestion Generator OpenAI
 *
 * AI-powered suggestion generator using OpenAI API.
 * Generates creative, contextual cooking suggestions based on pantry products.
 *
 * Features:
 * - Prioritizes urgent (expiring) ingredients
 * - Considers product combinations
 * - Generates realistic time estimates
 * - Provides brief recipe steps
 */

import OpenAI from 'openai';

import type { Logger } from '@domain/logger';
import type { Product } from '@domain/product/model';
import { isExpired } from '@domain/product/model';
import { daysUntilExpiry, getUrgencyLevel } from '@domain/product/urgency-messages';
import { SuggestionError } from '@domain/suggestion/errors';
import {
  createSuggestion,
  type Suggestion,
  type SuggestionIngredient,
  type TimeRange,
} from '@domain/suggestion/model';
import type { SuggestionGeneratorService } from '@domain/suggestion/services/suggestion-generator';

interface OpenAISuggestionResponse {
  id: string;
  title: string;
  description?: string;
  estimatedTime: TimeRange;
  ingredients: Array<{
    productId: string;
    productName: string;
    isUrgent: boolean;
  }>;
  steps?: string[];
}

export class SuggestionGeneratorOpenAI implements SuggestionGeneratorService {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly logger: Logger
  ) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generate(products: Product[], limit: number): Promise<Suggestion[]> {
    try {
      this.logger.info('Generating suggestions with OpenAI', {
        productCount: products.length,
        limit,
      });

      // Filter out expired products
      const usableProducts = products.filter((p) => !isExpired(p));

      if (usableProducts.length === 0) {
        return [];
      }

      // Build prompt
      const prompt = this.buildPrompt(usableProducts, limit);

      // Call OpenAI API
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw SuggestionError.GenerationFailed('OpenAI returned empty response');
      }

      // Parse JSON response
      const suggestions = this.parseResponse(content, usableProducts);

      this.logger.info('Generated suggestions successfully', {
        count: suggestions.length,
      });

      return suggestions;
    } catch (error) {
      this.logger.error('Failed to generate suggestions with OpenAI', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw SuggestionError.GenerationFailed(error instanceof Error ? error.message : undefined);
    }
  }

  private getSystemPrompt(): string {
    return `You are a helpful cooking assistant for a Spanish kitchen app called Foodie.
Your goal: help tired users decide what to cook quickly, prioritizing ingredients that are expiring soon.

Core principles:
- Keep suggestions SIMPLE (max 30 min cooking time)
- Prioritize products expiring soon
- Use realistic ingredient combinations
- Be calm and clear - this is for people who are tired
- Suggest 3-5 recipes maximum
- Focus on common Spanish/Mediterranean dishes when possible

Return ONLY valid JSON array, no additional text.`;
  }

  private buildPrompt(products: Product[], limit: number): string {
    const productList = products
      .map((p) => {
        const urgency = getUrgencyLevel(p);
        const days = daysUntilExpiry(p);
        const daysText = days !== null ? `expires in ${days} days` : 'no expiry date';

        return `- ${p.name} (${urgency}, ${daysText})`;
      })
      .join('\n');

    return `Given these products from the user's pantry, suggest ${limit} simple recipes they can make TODAY.

PRODUCTS (sorted by urgency):
${productList}

Requirements:
- Return ${limit} suggestions maximum
- Prioritize recipes using products expiring soon (use_today, use_soon)
- Keep recipes SIMPLE and realistic
- Estimate time: "quick" (~10min), "medium" (~20min), "long" (~30min)
- Provide 3-4 brief steps per recipe
- Use products from the list above

Return JSON array with this EXACT structure:
[
  {
    "title": "Recipe name in Spanish",
    "description": "Brief description mentioning urgent ingredients if any",
    "estimatedTime": "quick" | "medium" | "long",
    "ingredients": [
      {
        "productId": "product-id-from-list",
        "productName": "Product name",
        "isUrgent": true | false
      }
    ],
    "steps": ["Step 1", "Step 2", "Step 3"]
  }
]`;
  }

  private parseResponse(content: string, products: Product[]): Suggestion[] {
    try {
      // Remove markdown code blocks if present
      let jsonText = content.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText) as OpenAISuggestionResponse[];

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      return parsed.map((item, index) => {
        // Validate required fields
        if (!item.title || !item.estimatedTime || !item.ingredients) {
          throw new Error(`Invalid suggestion structure at index ${index}`);
        }

        // Map ingredients and validate product IDs
        const ingredients: SuggestionIngredient[] = item.ingredients.map((ing) => {
          const product = products.find((p) => p.id === ing.productId);

          return {
            productId: ing.productId,
            productName: ing.productName,
            quantity: product?.quantity,
            isUrgent: ing.isUrgent,
          };
        });

        return createSuggestion({
          id: `openai-${Date.now()}-${index}`,
          title: item.title,
          description: item.description,
          estimatedTime: item.estimatedTime,
          ingredients,
          steps: item.steps,
        });
      });
    } catch (error) {
      this.logger.error('Failed to parse OpenAI response', {
        error: error instanceof Error ? error.message : 'Unknown error',
        content: content.substring(0, 200),
      });
      throw SuggestionError.GenerationFailed('Invalid JSON response from AI');
    }
  }
}
