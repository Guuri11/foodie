import type {
  ProductIdentification,
  ProductIdentifierService,
} from '@domain/product/services/product-identifier';

export class ProductIdentifierStub implements ProductIdentifierService {
  async identifyByImage(imageBase64: string): Promise<ProductIdentification> {
    void imageBase64;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      name: 'Yogur natural',
      confidence: 'high',
      method: 'visual',
      suggestedLocation: 'fridge',
      suggestedQuantity: '4 x 125 g',
    };
  }

  async identifyByBarcode(barcode: string): Promise<ProductIdentification> {
    void barcode;
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      name: 'Leche entera',
      confidence: 'high',
      method: 'barcode',
      suggestedLocation: 'fridge',
      suggestedQuantity: '1 L',
    };
  }
}
