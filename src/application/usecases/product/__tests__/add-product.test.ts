import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import type { ProductRepository } from '@domain/product/repository';

import { AddProductUseCaseImpl } from '../add-product';

describe('AddProductUseCase', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
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
    useCase = new AddProductUseCaseImpl(mockRepository, mockLogger);
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
});
