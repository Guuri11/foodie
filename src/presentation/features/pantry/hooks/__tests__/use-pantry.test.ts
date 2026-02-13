import { act, renderHook } from '@testing-library/react-native';

import type { Product } from '@domain/product/model';

import { useProductStore } from '~/lib/stores/product-store';

import { usePantry } from '../use-pantry';

describe('usePantry', () => {
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
    useProductStore.setState({
      products: [
        makeProduct({ id: '1', name: 'Rice', status: 'new' }),
        makeProduct({
          id: '2',
          name: 'Milk',
          status: 'opened',
          expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
        makeProduct({ id: '3', name: 'Yogurt', status: 'almost_empty' }),
        makeProduct({ id: '4', name: 'Bread', status: 'opened' }),
      ],
      totalCount: 4,
      loading: false,
      error: null,
    });

    useProductStore.getState().initialize({
      getAllProducts: { execute: jest.fn().mockResolvedValue({ active: [], totalCount: 0 }) },
      addProduct: { execute: jest.fn() },
      updateProduct: { execute: jest.fn() },
    });
  });

  it('should_return_all_active_products_sorted_by_urgency', () => {
    // Given products with different urgencies
    const { result } = renderHook(() => usePantry());

    // Then all products are returned sorted by urgency (most urgent first)
    expect(result.current.products).toHaveLength(4);
    // Milk (expiring soon) should come before Rice (new, no urgency)
    const milkIndex = result.current.products.findIndex((p) => p.name === 'Milk');
    const riceIndex = result.current.products.findIndex((p) => p.name === 'Rice');
    expect(milkIndex).toBeLessThan(riceIndex);
  });

  it('should_filter_by_status_when_selected', () => {
    // Given products with different statuses
    const { result } = renderHook(() => usePantry());

    // When filtering by 'opened'
    act(() => {
      result.current.setSelectedStatus('opened');
    });

    // Then only opened products are returned
    expect(result.current.products.every((p) => p.status === 'opened')).toBe(true);
    expect(result.current.products).toHaveLength(2);
    expect(result.current.selectedStatus).toBe('opened');
  });

  it('should_show_all_when_filter_is_all', () => {
    // Given a filter was applied
    const { result } = renderHook(() => usePantry());

    act(() => {
      result.current.setSelectedStatus('opened');
    });

    // When resetting to 'all'
    act(() => {
      result.current.setSelectedStatus('all');
    });

    // Then all products are returned
    expect(result.current.products).toHaveLength(4);
    expect(result.current.selectedStatus).toBe('all');
  });
});
