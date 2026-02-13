import type {
  ExpiryEstimation,
  ExpiryEstimatorService,
} from '@domain/product/services/expiry-estimator';
import type { ProductLocation, ProductStatus } from '@domain/product/value-objects';

const SYSTEM_PROMPT = `You are an expiry date estimator for a Spanish kitchen inventory app.
Given a product name, its current status, and storage location, estimate how long until it expires.

Rules:
1. Return ONLY a JSON object with these fields:
   - "daysUntilExpiry": number of days from TODAY until the product expires (integer)
   - "confidence": "high" (well-known products), "medium" (reasonable guess), "low" (uncertain), or "none" (cannot estimate)

2. Consider the product's current status:
   - "new": Unopened, sealed package
   - "opened": Package has been opened
   - "almost_empty": Nearly finished
   - "finished": Empty (should not be called, but treat as 0 days)

3. Consider storage location (affects shelf life):
   - "fridge": Refrigerated (extends perishables)
   - "freezer": Frozen (significantly extends shelf life)
   - "pantry": Room temperature (dry goods)
   - undefined: Assume room temperature

4. Base estimates on food safety guidelines, not "best before" dates.

5. If you cannot estimate (e.g., too generic like "food"), return:
   {"daysUntilExpiry":null,"confidence":"none"}

Examples:
{"daysUntilExpiry":3,"confidence":"high"}  // Opened milk in fridge
{"daysUntilExpiry":180,"confidence":"high"} // New rice in pantry
{"daysUntilExpiry":2,"confidence":"high"}  // Opened chicken in fridge
{"daysUntilExpiry":null,"confidence":"none"} // Cannot estimate`;

interface ResponsesAPIInput {
  role: 'system' | 'user';
  content: string;
}

interface ResponsesAPIOutput {
  output: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

interface CacheKey {
  productName: string;
  status: ProductStatus;
  location?: ProductLocation;
}

/**
 * OpenAI-based expiry date estimator with in-memory caching (H2.3).
 *
 * Uses GPT-4o to estimate product expiry dates based on:
 * - Product name (e.g., "Milk", "Chicken breast")
 * - Current status (new/opened/almost_empty/finished)
 * - Storage location (fridge/freezer/pantry)
 *
 * Features:
 * - In-memory cache to avoid redundant API calls
 * - 10-second timeout for API requests
 * - Graceful error handling (never throws)
 *
 * TODO: Migrate cache from in-memory Map to AsyncStorage for persistence
 * across app restarts. Current implementation loses cache on reload.
 */
export class ExpiryEstimatorOpenAI implements ExpiryEstimatorService {
  private readonly cache = new Map<string, ExpiryEstimation>();
  private readonly TIMEOUT_MS = 10000; // 10 seconds

  constructor(private readonly apiKey: string) {}

  async estimateExpiryDate(
    productName: string,
    status: ProductStatus,
    location?: ProductLocation
  ): Promise<ExpiryEstimation> {
    // Check cache first
    const cacheKey = this.buildCacheKey({ productName, status, location });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Build user prompt
      const userPrompt = this.buildUserPrompt(productName, status, location);

      // Call OpenAI API with timeout
      const estimation = await this.callOpenAIWithTimeout(userPrompt);

      // Cache the result
      this.cache.set(cacheKey, estimation);

      return estimation;
    } catch (error) {
      // Fail gracefully - return "none" confidence with no date
      return { date: null, confidence: 'none' };
    }
  }

  private buildCacheKey(key: CacheKey): string {
    return `${key.productName.toLowerCase()}|${key.status}|${key.location ?? 'none'}`;
  }

  private buildUserPrompt(
    productName: string,
    status: ProductStatus,
    location?: ProductLocation
  ): string {
    const parts = [`Product: ${productName}`, `Status: ${status}`];

    if (location) {
      parts.push(`Location: ${location}`);
    }

    parts.push('Estimate expiry date.');

    return parts.join('\n');
  }

  private async callOpenAIWithTimeout(userPrompt: string): Promise<ExpiryEstimation> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const input: ResponsesAPIInput[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ];

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          input,
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error ${response.status}`);
      }

      const data = (await response.json()) as ResponsesAPIOutput;

      const textOutput = data.output
        ?.find((o) => o.type === 'message')
        ?.content?.find((c) => c.type === 'output_text')?.text;

      if (!textOutput) {
        throw new Error('Empty response from OpenAI');
      }

      return this.parseResponse(textOutput);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseResponse(content: string): ExpiryEstimation {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse expiry estimator response');
    }

    const parsed: unknown = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('daysUntilExpiry' in parsed) ||
      !('confidence' in parsed)
    ) {
      throw new Error('Invalid response format: expected {daysUntilExpiry, confidence}');
    }

    const obj = parsed as {
      daysUntilExpiry: number | null;
      confidence: string;
    };

    // Validate confidence level
    const validConfidences = ['high', 'medium', 'low', 'none'];
    const confidence = validConfidences.includes(obj.confidence)
      ? (obj.confidence as 'high' | 'medium' | 'low' | 'none')
      : 'none';

    // Calculate expiry date from days
    let date: Date | null = null;
    if (obj.daysUntilExpiry !== null && typeof obj.daysUntilExpiry === 'number') {
      const now = new Date();
      date = new Date(now);
      date.setDate(date.getDate() + obj.daysUntilExpiry);
    }

    return { date, confidence };
  }
}
