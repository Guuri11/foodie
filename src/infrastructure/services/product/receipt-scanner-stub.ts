import type {
  ReceiptScannerService,
  ReceiptScanResult,
} from '@domain/product/services/receipt-scanner';

export class ReceiptScannerStub implements ReceiptScannerService {
  async scan(imageBase64: string): Promise<ReceiptScanResult> {
    // Simulate network delay — imageBase64 intentionally unused in stub
    void imageBase64;
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      items: [
        { name: 'Leche entera', confidence: 'high' },
        { name: 'Pan de molde', confidence: 'high' },
        { name: 'Huevos', confidence: 'high' },
        { name: 'Tomate frito', confidence: 'high' },
        { name: 'Pechuga de pollo', confidence: 'high' },
        { name: 'Arroz', confidence: 'high' },
        { name: 'Yogur natural', confidence: 'low' },
        { name: 'Plátanos', confidence: 'high' },
        { name: 'Queso rallado', confidence: 'low' },
        { name: 'Aceite de oliva', confidence: 'high' },
      ],
    };
  }
}
