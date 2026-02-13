import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import type { ProductRepository } from '@domain/product/repository';
import type { EstimateExpiryUseCase } from '@domain/product/use-cases/estimate-expiry';

import { AddProductUseCaseImpl } from '../add-product';

describe('AddProductUseCase', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockEstimateExpiry: jest.Mocked<EstimateExpiryUseCase>;
  let useCase: AddProductUseCaseImpl;

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
    mockEstimateExpiry = {
      execute: jest.fn(),
    };
    useCase = new AddProductUseCaseImpl(mockRepository, mockLogger, mockEstimateExpiry);
  });

  it('should_add_product_with_status_new', async () => {
    // Given a valid product name
    mockRepository.save.mockResolvedValue(undefined);

    // When we add a product
    const product = await useCase.execute('Milk');

    // Then the product has status new
    expect(product.status).toBe('new');
    expect(product.name).toBe('Milk');
  });

  it('should_reject_empty_name', async () => {
    // Given an empty product name
    // When we try to add a product
    // Then it should throw a validation error
    await expect(useCase.execute('')).rejects.toThrow(ProductError);
  });

  it('should_reject_whitespace_only_name', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow(ProductError);
  });

  it('should_set_created_at_and_updated_at', async () => {
    // Given a valid product name
    mockRepository.save.mockResolvedValue(undefined);
    const before = new Date();

    // When we add a product
    const product = await useCase.execute('Milk');
    const after = new Date();

    // Then dates are set
    expect(product.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(product.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(product.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should_generate_unique_id', async () => {
    // Given a valid product name
    mockRepository.save.mockResolvedValue(undefined);

    // When we add two products
    const product1 = await useCase.execute('Milk');
    const product2 = await useCase.execute('Rice');

    // Then they have different IDs
    expect(product1.id).not.toBe(product2.id);
    expect(product1.id).toBeTruthy();
    expect(product2.id).toBeTruthy();
  });

  it('should_save_product_to_repository', async () => {
    // Given a valid product name
    mockRepository.save.mockResolvedValue(undefined);

    // When we add a product
    const product = await useCase.execute('Milk');

    // Then the product is persisted
    expect(mockRepository.save).toHaveBeenCalledWith(product);
  });

  it('should_log_operation', async () => {
    // Given a valid product name
    mockRepository.save.mockResolvedValue(undefined);

    // When we add a product
    await useCase.execute('Milk');

    // Then the operation is logged
    expect(mockLogger.info).toHaveBeenCalledWith('Adding product', { name: 'Milk' });
  });

  it('should_create_product_with_location_when_provided', async () => {
    // Given a valid product name with location
    mockRepository.save.mockResolvedValue(undefined);

    // When we add a product with location
    const product = await useCase.execute('Milk', { location: 'fridge' });

    // Then the product has the location
    expect(product.location).toBe('fridge');
  });

  it('should_create_product_with_quantity_when_provided', async () => {
    // Given a valid product name with quantity
    mockRepository.save.mockResolvedValue(undefined);

    // When we add a product with quantity
    const product = await useCase.execute('Milk', { quantity: '1 L' });

    // Then the product has the quantity
    expect(product.quantity).toBe('1 L');
  });

  it('should_create_product_without_extras_when_not_provided', async () => {
    // Given a valid product name without options
    mockRepository.save.mockResolvedValue(undefined);

    // When we add a product without options
    const product = await useCase.execute('Milk');

    // Then location and quantity are undefined
    expect(product.location).toBeUndefined();
    expect(product.quantity).toBeUndefined();
  });

  describe('Automatic expiry estimation (H2.3)', () => {
    it('should_estimate_expiry_automatically_when_product_added', async () => {
      // Given a product without manual expiry date
      mockRepository.save.mockResolvedValue(undefined);
      const mockProduct = { id: '1', name: 'Milk', status: 'new' };
      mockEstimateExpiry.execute.mockResolvedValue(mockProduct as any);

      // When we add the product
      const product = await useCase.execute('Milk');

      // Then expiry estimation is triggered
      expect(mockEstimateExpiry.execute).toHaveBeenCalledWith(product.id);
    });

    it('should_not_block_product_creation_when_estimation_fails', async () => {
      // Given estimation service fails
      mockRepository.save.mockResolvedValue(undefined);
      mockEstimateExpiry.execute.mockRejectedValue(new Error('API unavailable'));

      // When we add the product
      const product = await useCase.execute('Milk');

      // Then product is still created successfully
      expect(product.name).toBe('Milk');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should_estimate_expiry_considering_location_when_provided', async () => {
      // Given a product with location
      mockRepository.save.mockResolvedValue(undefined);
      const mockProduct = { id: '1', name: 'Milk', location: 'freezer', status: 'new' };
      mockEstimateExpiry.execute.mockResolvedValue(mockProduct as any);

      // When we add the product with freezer location
      const product = await useCase.execute('Milk', { location: 'freezer' });

      // Then estimation is called with product id
      expect(mockEstimateExpiry.execute).toHaveBeenCalledWith(product.id);
    });
  });
});
