import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { createProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';

import { UpdateProductUseCaseImpl } from '../update-product';

describe('UpdateProductUseCase', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: UpdateProductUseCaseImpl;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      getActiveProducts: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    useCase = new UpdateProductUseCaseImpl(mockRepository, mockLogger);
  });

  it('should_update_product_location_when_exists', async () => {
    // Given a product exists
    const product = createProduct({ id: '1', name: 'Milk' });
    mockRepository.getById.mockResolvedValue(product);
    mockRepository.save.mockResolvedValue(undefined);

    // When we update its location
    const result = await useCase.execute('1', { location: 'fridge' });

    // Then it has the new location
    expect(result.location).toBe('fridge');
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should_update_product_quantity_when_exists', async () => {
    // Given a product exists
    const product = createProduct({ id: '1', name: 'Milk' });
    mockRepository.getById.mockResolvedValue(product);
    mockRepository.save.mockResolvedValue(undefined);

    // When we update its quantity
    const result = await useCase.execute('1', { quantity: '1 L' });

    // Then it has the new quantity
    expect(result.quantity).toBe('1 L');
  });

  it('should_throw_not_found_when_missing', async () => {
    // Given the product doesn't exist
    mockRepository.getById.mockResolvedValue(null);

    // When we try to update it
    // Then it throws not_found error
    await expect(useCase.execute('999', { location: 'fridge' })).rejects.toThrow(ProductError);

    try {
      await useCase.execute('999', { location: 'fridge' });
    } catch (e) {
      expect((e as ProductError).code).toBe('not_found');
    }
  });

  it('should_log_update_operation', async () => {
    // Given a product exists
    const product = createProduct({ id: '1', name: 'Milk' });
    mockRepository.getById.mockResolvedValue(product);
    mockRepository.save.mockResolvedValue(undefined);

    // When we update it
    await useCase.execute('1', { location: 'fridge' });

    // Then the operation is logged
    expect(mockLogger.info).toHaveBeenCalledWith('Updating product', { id: '1' });
  });

  it('should_persist_updated_product', async () => {
    // Given a product exists
    const product = createProduct({ id: '1', name: 'Milk' });
    mockRepository.getById.mockResolvedValue(product);
    mockRepository.save.mockResolvedValue(undefined);

    // When we update it
    const result = await useCase.execute('1', { location: 'fridge' });

    // Then the updated product is saved
    expect(mockRepository.save).toHaveBeenCalledWith(result);
  });

  it('should_clear_field_when_set_to_undefined', async () => {
    // Given a product with a location
    const product = createProduct({ id: '1', name: 'Milk', location: 'fridge' });
    mockRepository.getById.mockResolvedValue(product);
    mockRepository.save.mockResolvedValue(undefined);

    // When we clear the location
    const result = await useCase.execute('1', { location: undefined });

    // Then location is cleared
    expect(result.location).toBeUndefined();
  });
});
