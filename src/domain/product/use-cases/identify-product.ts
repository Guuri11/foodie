import type { ProductIdentification } from '../services/product-identifier';

export interface IdentifyProductUseCase {
  executeByImage(imageBase64: string): Promise<ProductIdentification>;
  executeByBarcode(barcode: string): Promise<ProductIdentification>;
}
