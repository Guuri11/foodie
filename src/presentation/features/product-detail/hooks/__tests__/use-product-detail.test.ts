import { act, renderHook } from '@testing-library/react-native';

import type { Product } from '@domain/product/model';

import { useProductStore } from '~/lib/stores/product-store';

import { useProductDetail } from '../use-product-detail';

describe('useProductDetail', () => {
  let mockUpdateProductExecute: jest.Mock;
  let mockGetAllProductsExecute: jest.Mock;

  const now = new Date();

  function makeProduct(overrides: Partial<Product> & { id: string; name: string }): Product {
    return {
      status: 'new',
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  beforeEach(() => {
    mockUpdateProductExecute = jest.fn();
    mockGetAllProductsExecute = jest.fn().mockResolvedValue({ active: [], totalCount: 0 });

    useProductStore.setState({
      products: [
        makeProduct({ id: '1', name: 'Leche', location: 'fridge', quantity: '1 L' }),
        makeProduct({ id: '2', name: 'Arroz' }),
      ],
      totalCount: 2,
      loading: false,
      error: null,
    });

    useProductStore.getState().initialize({
      getAllProducts: { execute: mockGetAllProductsExecute },
      addProduct: { execute: jest.fn() },
      updateProduct: { execute: mockUpdateProductExecute },
    });
  });

  it('should_return_product_when_found_in_store', () => {
    // Given a product exists in the store
    const { result } = renderHook(() => useProductDetail('1'));

    // Then the product is returned
    expect(result.current.product).not.toBeNull();
    expect(result.current.product?.name).toBe('Leche');
  });

  it('should_return_null_when_not_in_store', () => {
    // Given the product id doesn't exist
    const { result } = renderHook(() => useProductDetail('999'));

    // Then product is null
    expect(result.current.product).toBeNull();
  });

  it('should_update_location_via_store', async () => {
    // Given a product exists
    mockUpdateProductExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductDetail('1'));

    // When we set the location
    await act(async () => {
      await result.current.setLocation('pantry');
    });

    // Then updateProduct is called with the location change
    expect(mockUpdateProductExecute).toHaveBeenCalledWith('1', { location: 'pantry' });
  });

  it('should_update_quantity_via_store', async () => {
    // Given a product exists
    mockUpdateProductExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductDetail('1'));

    // When we set the quantity
    await act(async () => {
      await result.current.setQuantity('2 L');
    });

    // Then updateProduct is called with the quantity change
    expect(mockUpdateProductExecute).toHaveBeenCalledWith('1', { quantity: '2 L' });
  });

  it('should_clear_quantity_when_empty_string', async () => {
    // Given a product with quantity
    mockUpdateProductExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductDetail('1'));

    // When we set quantity to empty string
    await act(async () => {
      await result.current.setQuantity('');
    });

    // Then quantity is cleared (undefined)
    expect(mockUpdateProductExecute).toHaveBeenCalledWith('1', { quantity: undefined });
  });

  it('should_trim_quantity_before_saving', async () => {
    // Given a product exists
    mockUpdateProductExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProductDetail('1'));

    // When we set quantity with whitespace
    await act(async () => {
      await result.current.setQuantity('  2 L  ');
    });

    // Then quantity is trimmed
    expect(mockUpdateProductExecute).toHaveBeenCalledWith('1', { quantity: '2 L' });
  });
});
