import type {
  ReceiptItem,
  ReceiptScannerService,
  ReceiptScanResult,
} from '@domain/product/services/receipt-scanner';

const SYSTEM_PROMPT = `You are a receipt scanner for a Spanish kitchen inventory app.
Extract product names from this supermarket receipt image.
Return ONLY a JSON array of objects with "name" and "confidence" fields.
- "name": the product name in Spanish, cleaned up (no brand, no weight, no price)
- "confidence": "high" if clearly readable, "low" if uncertain
- Filter out non-food items (bags, discounts, totals, store info)
- Keep it simple: "Leche entera", not "LECHE ENTERA HACENDADO 1L 0.89"

Example output:
[{"name":"Leche entera","confidence":"high"},{"name":"Pan de molde","confidence":"high"},{"name":"Manzanas","confidence":"low"}]`;

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
  // Remove data URL prefix if already present
  const stripped = raw.replace(/^data:image\/[a-z]+;base64,/i, '');
  // Remove any whitespace/newlines that expo-camera might include
  const clean = stripped.replace(/\s/g, '');
  return `data:image/jpeg;base64,${clean}`;
}

export class ReceiptScannerOpenAI implements ReceiptScannerService {
  constructor(private readonly apiKey: string) {}

  async scan(imageBase64: string): Promise<ReceiptScanResult> {
    const imageUrl = toCleanDataUrl(imageBase64);

    const input: ResponsesAPIInput[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'input_image',
            image_url: imageUrl,
            detail: 'high',
          },
          {
            type: 'input_text',
            text: 'Extract the product names from this receipt.',
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

    return this.parseResponse(textOutput);
  }

  private parseResponse(content: string): ReceiptScanResult {
    // Extract JSON from the response (it may be wrapped in markdown code fences)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse receipt scanner response');
    }

    const parsed: unknown = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) {
      throw new Error('Invalid response format: expected array');
    }

    const items: ReceiptItem[] = parsed
      .filter(
        (item): item is { name: string; confidence: string } =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.name === 'string' &&
          typeof item.confidence === 'string'
      )
      .map((item) => ({
        name: item.name,
        confidence: item.confidence === 'low' ? 'low' : 'high',
      }));

    return { items };
  }
}
