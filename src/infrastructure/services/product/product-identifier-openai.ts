import type {
  ProductIdentification,
  ProductIdentifierService,
} from '@domain/product/services/product-identifier';
import type { ProductLocation } from '@domain/product/value-objects';

const VALID_LOCATIONS: ProductLocation[] = ['fridge', 'pantry', 'freezer'];

const SYSTEM_PROMPT = `You are a product identifier for a Spanish kitchen inventory app.
Identify this single food product from the image.
Return ONLY a JSON object with these fields:
- "name": the product name in Spanish, cleaned up (no brand, no weight, no price)
- "confidence": "high" if clearly identifiable, "low" if uncertain
- "suggestedLocation": where this product is typically stored: "fridge", "pantry", or "freezer" (optional)
- "suggestedQuantity": the quantity if visible on the package, e.g. "1 L", "500 g" (optional)
- If you cannot identify the product at all, return {"name":"","confidence":"low"}

Example outputs:
{"name":"Yogur natural","confidence":"high","suggestedLocation":"fridge","suggestedQuantity":"4 x 125 g"}
{"name":"Arroz","confidence":"high","suggestedLocation":"pantry"}`;

interface ResponsesAPIInput {
  role: 'system' | 'user';
  content: string | Array<{ type: string; text?: string; image_url?: string; detail?: string }>;
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

/**
 * Strips any existing data-URL prefix and whitespace from a base64 string,
 * then re-wraps it with the correct JPEG data URL prefix.
 */
function toCleanDataUrl(raw: string): string {
  const stripped = raw.replace(/^data:image\/[a-z]+;base64,/i, '');
  const clean = stripped.replace(/\s/g, '');
  return `data:image/jpeg;base64,${clean}`;
}

interface OpenFoodFactsProduct {
  product_name_es?: string;
  product_name?: string;
  quantity?: string;
  categories_tags?: string[];
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export class ProductIdentifierOpenAI implements ProductIdentifierService {
  constructor(private readonly apiKey: string) {}

  async identifyByImage(imageBase64: string): Promise<ProductIdentification> {
    const imageUrl = toCleanDataUrl(imageBase64);

    const input: ResponsesAPIInput[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'input_image',
            image_url: imageUrl,
            detail: 'low',
          },
          {
            type: 'input_text',
            text: 'Identify this food product.',
          },
        ],
      },
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
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as ResponsesAPIOutput;

    const textOutput = data.output
      ?.find((o) => o.type === 'message')
      ?.content?.find((c) => c.type === 'output_text')?.text;

    if (!textOutput) {
      throw new Error('Empty response from OpenAI');
    }

    return this.parseImageResponse(textOutput);
  }

  async identifyByBarcode(barcode: string): Promise<ProductIdentification> {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
    );

    if (!response.ok) {
      throw new Error(`Open Food Facts API error ${response.status}`);
    }

    const data = (await response.json()) as OpenFoodFactsResponse;

    if (data.status !== 1 || !data.product) {
      throw new Error('Product not found in barcode database');
    }

    const name = data.product.product_name_es || data.product.product_name || '';

    if (!name) {
      throw new Error('Product found but has no name');
    }

    const result: ProductIdentification = {
      name,
      confidence: 'high',
      method: 'barcode',
    };

    if (data.product.quantity) {
      result.suggestedQuantity = data.product.quantity;
    }

    const categories = data.product.categories_tags ?? [];
    const suggestedLocation = this.inferLocationFromCategories(categories);
    if (suggestedLocation) {
      result.suggestedLocation = suggestedLocation;
    }

    return result;
  }

  private parseImageResponse(content: string): ProductIdentification {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse product identifier response');
    }

    const parsed: unknown = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('name' in parsed) ||
      !('confidence' in parsed)
    ) {
      throw new Error('Invalid response format: expected {name, confidence}');
    }

    const obj = parsed as {
      name: string;
      confidence: string;
      suggestedLocation?: string;
      suggestedQuantity?: string;
    };

    const result: ProductIdentification = {
      name: obj.name,
      confidence: obj.confidence === 'low' ? 'low' : 'high',
      method: 'visual',
    };

    if (
      obj.suggestedLocation &&
      VALID_LOCATIONS.includes(obj.suggestedLocation as ProductLocation)
    ) {
      result.suggestedLocation = obj.suggestedLocation as ProductLocation;
    }

    if (obj.suggestedQuantity) {
      result.suggestedQuantity = obj.suggestedQuantity;
    }

    return result;
  }

  private inferLocationFromCategories(categories: string[]): ProductLocation | undefined {
    const joined = categories.join(',').toLowerCase();

    if (joined.includes('frozen') || joined.includes('congel')) {
      return 'freezer';
    }
    if (
      joined.includes('dairy') ||
      joined.includes('lact') ||
      joined.includes('fresh') ||
      joined.includes('fresc') ||
      joined.includes('meat') ||
      joined.includes('carn') ||
      joined.includes('fish') ||
      joined.includes('pescad')
    ) {
      return 'fridge';
    }

    return 'pantry';
  }
}
