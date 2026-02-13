import type { Product } from '@domain/product/model';

import { useProductStore } from '../product-store';

describe('ProductStore — addProducts batch', () => {
  let mockAddProductExecute: jest.Mock;
  let mockGetAllProductsExecute: jest.Mock;

  beforeEach(() => {
    mockAddProductExecute = jest.fn();
    mockGetAllProductsExecute = jest.fn().mockResolvedValue({ active: [], totalCount: 0 });

    useProductStore.setState({
      products: [],
      totalCount: 0,
      loading: false,
      error: null,
    });

    useProductStore.getState().initialize({
      getAllProducts: { execute: mockGetAllProductsExecute },
      addProduct: { execute: mockAddProductExecute },
      updateProduct: { execute: jest.fn() },
    });
  });

  it('should_add_multiple_products_in_batch', async () => {
    // Given three product names to add
    const now = new Date();
    mockAddProductExecute.mockImplementation((name: string) =>
      Promise.resolve({
        id: name,
        name,
        status: 'new',
        createdAt: now,
        updatedAt: now,
      } as Product)
    );

    // When we add them in batch
    await useProductStore.getState().addProducts(['Leche', 'Pan', 'Huevos']);

    // Then addProduct.execute is called for each
    expect(mockAddProductExecute).toHaveBeenCalledTimes(3);
    expect(mockAddProductExecute).toHaveBeenCalledWith('Leche');
    expect(mockAddProductExecute).toHaveBeenCalledWith('Pan');
    expect(mockAddProductExecute).toHaveBeenCalledWith('Huevos');

    // And loadProducts is called once at the end
    expect(mockGetAllProductsExecute).toHaveBeenCalled();
  });

  it('should_continue_batch_on_individual_failure', async () => {
    // Given the second product will fail
    const now = new Date();
    mockAddProductExecute
      .mockResolvedValueOnce({
        id: '1',
        name: 'Leche',
        status: 'new',
        createdAt: now,
        updatedAt: now,
      } as Product)
      .mockRejectedValueOnce(new Error('Failed to add Pan'))
      .mockResolvedValueOnce({
        id: '3',
        name: 'Huevos',
        status: 'new',
        createdAt: now,
        updatedAt: now,
      } as Product);

    // When we add them in batch
    await useProductStore.getState().addProducts(['Leche', 'Pan', 'Huevos']);

    // Then all three were attempted
    expect(mockAddProductExecute).toHaveBeenCalledTimes(3);

    // And loadProducts is still called
    expect(mockGetAllProductsExecute).toHaveBeenCalled();
  });
});
