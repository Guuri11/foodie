import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import type { Product } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';

import { AddProductUseCaseImpl } from '../add-product';

describe('AddProductUseCase', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: AddProductUseCaseImpl;

  const backendProduct: Product = {
    id: 'backend-uuid-123',
    name: 'Milk',
    status: 'new',
    createdAt: new Date('2026-02-16T10:00:00Z'),
    updatedAt: new Date('2026-02-16T10:00:00Z'),
  };

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
    useCase = new AddProductUseCaseImpl(mockRepository, mockLogger);
  });

  it('should_return_product_from_backend_when_created', async () => {
    // Given the backend returns a product with its own ID
    mockRepository.create.mockResolvedValue(backendProduct);

    // When we add a product
    const product = await useCase.execute('Milk');

    // Then we get the backend product (not a local one)
    expect(product.id).toBe('backend-uuid-123');
    expect(product.name).toBe('Milk');
    expect(product.status).toBe('new');
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

  it('should_call_repository_create_with_correct_params', async () => {
    // Given a valid product name
    mockRepository.create.mockResolvedValue(backendProduct);

    // When we add a product
    await useCase.execute('Milk');

    // Then repository.create is called with trimmed name
    expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Milk' });
  });

  it('should_pass_location_to_repository_create', async () => {
    // Given a product with location
    mockRepository.create.mockResolvedValue({ ...backendProduct, location: 'fridge' });

    // When we add a product with location
    await useCase.execute('Milk', { location: 'fridge' });

    // Then repository.create receives the location
    expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Milk', location: 'fridge' });
  });

  it('should_pass_quantity_to_repository_create', async () => {
    // Given a product with quantity
    mockRepository.create.mockResolvedValue({ ...backendProduct, quantity: '1 L' });

    // When we add a product with quantity
    await useCase.execute('Milk', { quantity: '1 L' });

    // Then repository.create receives the quantity
    expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Milk', quantity: '1 L' });
  });

  it('should_not_call_save', async () => {
    // Given a valid product name
    mockRepository.create.mockResolvedValue(backendProduct);

    // When we add a product
    await useCase.execute('Milk');

    // Then save is NOT called (create handles persistence)
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should_log_operation', async () => {
    // Given a valid product name
    mockRepository.create.mockResolvedValue(backendProduct);

    // When we add a product
    await useCase.execute('Milk');

    // Then the operation is logged
    expect(mockLogger.info).toHaveBeenCalledWith('Adding product', { name: 'Milk' });
  });

  it('should_trim_name_before_logging_and_creating', async () => {
    // Given a name with whitespace
    mockRepository.create.mockResolvedValue(backendProduct);

    // When we add a product with extra spaces
    await useCase.execute('  Milk  ');

    // Then the name is trimmed
    expect(mockLogger.info).toHaveBeenCalledWith('Adding product', { name: 'Milk' });
    expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Milk' });
  });
});
