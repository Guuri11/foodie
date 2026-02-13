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

  it('should_update_status_via_store_when_setStatus_called', async () => {
    // Given a product exists
    mockUpdateProductExecute.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProductDetail('1'));

    // When we set the status
    await act(async () => {
      await result.current.setStatus('opened');
    });

    // Then updateProduct is called with the status change
    expect(mockUpdateProductExecute).toHaveBeenCalledWith('1', { status: 'opened' });
  });

  it('should_set_expiry_date_via_store', async () => {
    // Given a product exists
    mockUpdateProductExecute.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProductDetail('1'));
    const date = new Date('2025-12-31');

    // When we set an expiry date
    await act(async () => {
      await result.current.setExpiryDate(date);
    });

    // Then updateProduct is called with the expiry date
    expect(mockUpdateProductExecute).toHaveBeenCalledWith('1', { expiryDate: date });
  });

  it('should_clear_expiry_date_when_undefined', async () => {
    // Given a product with an expiry date
    mockUpdateProductExecute.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProductDetail('1'));

    // When we clear the expiry date
    await act(async () => {
      await result.current.setExpiryDate(undefined);
    });

    // Then updateProduct is called with null to clear
    expect(mockUpdateProductExecute).toHaveBeenCalledWith('1', { expiryDate: null });
  });

  it('should_return_urgency_info_when_product_has_expiry', () => {
    // Given a product with an expiry date that is expired
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    useProductStore.setState({
      products: [makeProduct({ id: '1', name: 'Leche', expiryDate: yesterday })],
      totalCount: 1,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useProductDetail('1'));

    // Then urgencyInfo reflects the expiry state
    expect(result.current.urgencyInfo.level).toBe('wouldnt_trust');
    expect(result.current.urgencyInfo.messageKey).toBe('product.urgency.wouldnt_trust');
  });

  it('should_return_ok_urgency_when_no_expiry', () => {
    // Given a product without expiry date
    const { result } = renderHook(() => useProductDetail('2'));

    // Then urgencyInfo is 'ok'
    expect(result.current.urgencyInfo).toEqual({ level: 'ok', messageKey: 'product.urgency.ok' });
  });
});
