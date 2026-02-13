import type { Logger } from '@domain/logger';
import type { ProductIdentifierService } from '@domain/product/services/product-identifier';

import { IdentifyProductUseCaseImpl } from '../identify-product';

describe('IdentifyProductUseCase', () => {
  let mockIdentifier: jest.Mocked<ProductIdentifierService>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: IdentifyProductUseCaseImpl;

  beforeEach(() => {
    mockIdentifier = {
      identifyByImage: jest.fn(),
      identifyByBarcode: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    useCase = new IdentifyProductUseCaseImpl(mockIdentifier, mockLogger);
  });

  it('should_return_identification_when_image_recognized', async () => {
    // Given the identifier recognizes the product by image
    const identification = {
      name: 'Yogur natural',
      confidence: 'high' as const,
      method: 'visual' as const,
    };
    mockIdentifier.identifyByImage.mockResolvedValue(identification);

    // When we identify by image
    const result = await useCase.executeByImage('base64imagedata');

    // Then the identification is returned
    expect(result).toEqual(identification);
    expect(mockIdentifier.identifyByImage).toHaveBeenCalledWith('base64imagedata');
  });

  it('should_return_identification_when_barcode_found', async () => {
    // Given the identifier finds the product by barcode
    const identification = {
      name: 'Leche entera',
      confidence: 'high' as const,
      method: 'barcode' as const,
    };
    mockIdentifier.identifyByBarcode.mockResolvedValue(identification);

    // When we identify by barcode
    const result = await useCase.executeByBarcode('8410000810004');

    // Then the identification is returned
    expect(result).toEqual(identification);
    expect(mockIdentifier.identifyByBarcode).toHaveBeenCalledWith('8410000810004');
  });

  it('should_log_image_identification', async () => {
    // Given a successful image identification
    mockIdentifier.identifyByImage.mockResolvedValue({
      name: 'Yogur natural',
      confidence: 'high',
      method: 'visual',
    });

    // When we identify by image
    await useCase.executeByImage('base64imagedata');

    // Then the operation is logged
    expect(mockLogger.info).toHaveBeenCalledWith('Identifying product by image');
    expect(mockLogger.info).toHaveBeenCalledWith('Product identified by image', {
      name: 'Yogur natural',
      confidence: 'high',
    });
  });

  it('should_log_barcode_identification', async () => {
    // Given a successful barcode identification
    mockIdentifier.identifyByBarcode.mockResolvedValue({
      name: 'Leche entera',
      confidence: 'high',
      method: 'barcode',
    });

    // When we identify by barcode
    await useCase.executeByBarcode('8410000810004');

    // Then the operation is logged with barcode
    expect(mockLogger.info).toHaveBeenCalledWith('Identifying product by barcode', {
      barcode: '8410000810004',
    });
    expect(mockLogger.info).toHaveBeenCalledWith('Product identified by barcode', {
      name: 'Leche entera',
      confidence: 'high',
    });
  });

  it('should_propagate_image_errors', async () => {
    // Given the identifier fails for image
    mockIdentifier.identifyByImage.mockRejectedValue(new Error('OpenAI API error'));

    // When we try to identify by image
    // Then the error surfaces
    await expect(useCase.executeByImage('base64imagedata')).rejects.toThrow('OpenAI API error');
  });

  it('should_propagate_barcode_errors', async () => {
    // Given the identifier fails for barcode
    mockIdentifier.identifyByBarcode.mockRejectedValue(new Error('Product not found'));

    // When we try to identify by barcode
    // Then the error surfaces
    await expect(useCase.executeByBarcode('0000000000000')).rejects.toThrow('Product not found');
  });
});
