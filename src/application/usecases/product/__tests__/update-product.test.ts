import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { createProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { EstimateExpiryUseCase } from '@domain/product/use-cases/estimate-expiry';

import { UpdateProductUseCaseImpl } from '../update-product';

describe('UpdateProductUseCase', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockEstimateExpiry: jest.Mocked<EstimateExpiryUseCase>;
  let useCase: UpdateProductUseCaseImpl;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      getActiveProducts: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    mockEstimateExpiry = {
      execute: jest.fn(),
    };
    useCase = new UpdateProductUseCaseImpl(mockRepository, mockLogger, mockEstimateExpiry);
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

  it('should_update_manual_expiry_date_when_provided', async () => {
    // Given a product without expiry date
    const product = createProduct({ id: '1', name: 'Milk' });
    mockRepository.getById.mockResolvedValue(product);
    mockRepository.save.mockResolvedValue(undefined);

    // When we set manual expiry date
    const expiryDate = new Date('2025-02-25');
    const result = await useCase.execute('1', { expiryDate });

    // Then expiry date is set
    expect(result.expiryDate).toEqual(expiryDate);
  });

  it('should_clear_manual_expiry_date_when_set_to_undefined', async () => {
    // Given a product with manual expiry date
    const product = createProduct({
      id: '1',
      name: 'Milk',
      expiryDate: new Date('2025-02-25'),
    });
    mockRepository.getById.mockResolvedValue(product);
    mockRepository.save.mockResolvedValue(undefined);

    // When we clear the expiry date
    const result = await useCase.execute('1', { expiryDate: undefined });

    // Then expiry date is cleared
    expect(result.expiryDate).toBeUndefined();
  });

  describe('Automatic expiry re-estimation (H2.3)', () => {
    it('should_re_estimate_expiry_when_location_changes', async () => {
      // Given a product in pantry
      const product = createProduct({ id: '1', name: 'Milk', location: 'pantry' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);
      const updatedProduct = { ...product, location: 'fridge' };
      mockEstimateExpiry.execute.mockResolvedValue(updatedProduct as any);

      // When we move it to fridge
      await useCase.execute('1', { location: 'fridge' });

      // Then expiry is re-estimated
      expect(mockEstimateExpiry.execute).toHaveBeenCalledWith('1');
    });

    it('should_re_estimate_when_moving_to_freezer', async () => {
      // Given a product in fridge
      const product = createProduct({ id: '1', name: 'Chicken', location: 'fridge' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);
      const frozenProduct = { ...product, location: 'freezer' };
      mockEstimateExpiry.execute.mockResolvedValue(frozenProduct as any);

      // When we move it to freezer
      await useCase.execute('1', { location: 'freezer' });

      // Then expiry is re-estimated (much longer shelf life)
      expect(mockEstimateExpiry.execute).toHaveBeenCalledWith('1');
    });

    it('should_not_re_estimate_when_location_not_changed', async () => {
      // Given a product exists
      const product = createProduct({ id: '1', name: 'Milk', location: 'fridge' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we update only quantity (not location)
      await useCase.execute('1', { quantity: '500ml' });

      // Then expiry is NOT re-estimated
      expect(mockEstimateExpiry.execute).not.toHaveBeenCalled();
    });

    it('should_not_block_location_change_when_estimation_fails', async () => {
      // Given a product exists
      const product = createProduct({ id: '1', name: 'Milk', location: 'pantry' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);
      mockEstimateExpiry.execute.mockRejectedValue(new Error('API unavailable'));

      // When we change location
      const result = await useCase.execute('1', { location: 'fridge' });

      // Then location is still updated successfully
      expect(result.location).toBe('fridge');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should_not_re_estimate_when_manual_expiry_date_is_set', async () => {
      // Given a product exists
      const product = createProduct({ id: '1', name: 'Milk', location: 'pantry' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we update with manual expiry date AND location
      const expiryDate = new Date('2025-02-25');
      await useCase.execute('1', { location: 'fridge', expiryDate });

      // Then expiry is NOT re-estimated (manual date takes precedence)
      expect(mockEstimateExpiry.execute).not.toHaveBeenCalled();
    });
  });
});
