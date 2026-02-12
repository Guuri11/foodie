import type { Logger } from '@domain/logger';
import type { Product } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';

import { GetAllProductsUseCaseImpl } from '../get-all-products';

describe('GetAllProductsUseCase', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: GetAllProductsUseCaseImpl;

  const now = new Date();

  const activeProduct: Product = {
    id: '1',
    name: 'Milk',
    status: 'opened',
    createdAt: now,
    updatedAt: now,
  };

  const anotherActiveProduct: Product = {
    id: '2',
    name: 'Rice',
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };

  const finishedProduct: Product = {
    id: '3',
    name: 'Yogurt',
    status: 'finished',
    outcome: 'used',
    createdAt: now,
    updatedAt: now,
  };

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
    useCase = new GetAllProductsUseCaseImpl(mockRepository, mockLogger);
  });

  it('should_return_all_active_products_when_products_exist', async () => {
    // Given active products exist
    mockRepository.getActiveProducts.mockResolvedValue([activeProduct, anotherActiveProduct]);

    // When we get all products
    const result = await useCase.execute();

    // Then all active products are returned
    expect(result).toEqual([activeProduct, anotherActiveProduct]);
    expect(result).toHaveLength(2);
  });

  it('should_return_empty_array_when_no_products', async () => {
    // Given no products exist
    mockRepository.getActiveProducts.mockResolvedValue([]);

    // When we get all products
    const result = await useCase.execute();

    // Then empty array is returned
    expect(result).toEqual([]);
  });

  it('should_exclude_finished_products', async () => {
    // Given the repository returns only active products (excluding finished)
    mockRepository.getActiveProducts.mockResolvedValue([activeProduct]);

    // When we get all products
    const result = await useCase.execute();

    // Then finished products are not included
    expect(result).not.toContainEqual(finishedProduct);
    expect(mockRepository.getActiveProducts).toHaveBeenCalled();
  });

  it('should_log_operation', async () => {
    // Given products exist
    mockRepository.getActiveProducts.mockResolvedValue([activeProduct]);

    // When we get all products
    await useCase.execute();

    // Then the operation is logged
    expect(mockLogger.info).toHaveBeenCalledWith('Getting all active products');
  });
});
