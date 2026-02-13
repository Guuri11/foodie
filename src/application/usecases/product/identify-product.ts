import type { Logger } from '@domain/logger';
import type {
  ProductIdentification,
  ProductIdentifierService,
} from '@domain/product/services/product-identifier';
import type { IdentifyProductUseCase } from '@domain/product/use-cases/identify-product';

export class IdentifyProductUseCaseImpl implements IdentifyProductUseCase {
  constructor(
    private readonly identifier: ProductIdentifierService,
    private readonly logger: Logger
  ) {}

  async executeByImage(imageBase64: string): Promise<ProductIdentification> {
    this.logger.info('Identifying product by image');

    const result = await this.identifier.identifyByImage(imageBase64);

    this.logger.info('Product identified by image', {
      name: result.name,
      confidence: result.confidence,
    });

    return result;
  }

  async executeByBarcode(barcode: string): Promise<ProductIdentification> {
    this.logger.info('Identifying product by barcode', { barcode });

    const result = await this.identifier.identifyByBarcode(barcode);

    this.logger.info('Product identified by barcode', {
      name: result.name,
      confidence: result.confidence,
    });

    return result;
  }
}
