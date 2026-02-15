import type {
  ReceiptItem,
  ReceiptScannerService,
  ReceiptScanResult,
} from '@domain/product/services/receipt-scanner';

interface ReceiptScanApiResponse {
  items: Array<{
    name: string;
    confidence: 'high' | 'low';
  }>;
}

/**
 * Backend-based receipt scanner.
 *
 * Delegates receipt image analysis to the Rust backend, which calls OpenAI internally.
 * The mobile app does not need an OpenAI API key.
 */
export class ReceiptScannerBackend implements ReceiptScannerService {
  constructor(private readonly apiBaseUrl: string) {}

  async scan(imageBase64: string): Promise<ReceiptScanResult> {
    const response = await fetch(`${this.apiBaseUrl}/products/scan-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backend API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as ReceiptScanApiResponse;

    const items: ReceiptItem[] = data.items.map((item) => ({
      name: item.name,
      confidence: item.confidence,
    }));

    return { items };
  }
}
