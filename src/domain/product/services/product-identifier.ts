import type { ProductLocation } from '../value-objects';

export interface ProductIdentification {
  name: string;
  confidence: 'high' | 'low';
  method: 'barcode' | 'visual';
  suggestedLocation?: ProductLocation;
  suggestedQuantity?: string;
}

export interface ProductIdentifierService {
  identifyByImage(imageBase64: string): Promise<ProductIdentification>;
  identifyByBarcode(barcode: string): Promise<ProductIdentification>;
}
