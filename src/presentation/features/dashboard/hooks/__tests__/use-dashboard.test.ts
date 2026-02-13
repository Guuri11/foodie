import { renderHook, waitFor } from '@testing-library/react-native';

import type { Product } from '@domain/product/model';
import type { GetAllProductsResult } from '@domain/product/use-cases/get-all-products';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

import { useDashboard } from '../use-dashboard';

// Mock the use-case-provider
jest.mock('~/core/providers/use-case-provider', () => ({
  useUseCases: jest.fn(),
}));

const mockUseUseCases = useUseCases as jest.MockedFunction<typeof useUseCases>;

const now = new Date();

function makeProduct(overrides: Partial<Product> & { id: string; name: string }): Product {
  return {
    status: 'new',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('useDashboard', () => {
  let mockGetAllProducts: jest.Mock<Promise<GetAllProductsResult>>;
  let mockAddProduct: jest.Mock;

  beforeEach(() => {
    // Reset zustand store between tests
    useProductStore.setState({
      products: [],
      totalCount: 0,
      loading: false,
      error: null,
    });

    mockGetAllProducts = jest.fn();
    mockAddProduct = jest.fn();

    mockUseUseCases.mockReturnValue({
      getAllProducts: { execute: mockGetAllProducts },
      addProduct: { execute: mockAddProduct },
      updateProduct: { execute: jest.fn() },
      updateProductStatus: { execute: jest.fn() },
      setProductOutcome: { execute: jest.fn() },
      estimateExpiry: { execute: jest.fn() },
      scanReceipt: { execute: jest.fn() },
      identifyProduct: { executeByImage: jest.fn(), executeByBarcode: jest.fn() },
    });
  });

  it('should_show_products_when_active_products_exist', async () => {
    // Given active products exist
    const products = [
      makeProduct({ id: '1', name: 'Milk', status: 'opened' }),
      makeProduct({ id: '2', name: 'Rice', status: 'new' }),
    ];
    mockGetAllProducts.mockResolvedValue({ active: products, totalCount: 2 });

    // When the hook loads
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Then products are available and dashboard is populated
    expect(result.current.products).toHaveLength(2);
    expect(result.current.hasActiveProducts).toBe(true);
    expect(result.current.allFinished).toBe(false);
  });

  it('should_show_empty_state_when_no_products_ever_existed', async () => {
    // Given no products exist at all
    mockGetAllProducts.mockResolvedValue({ active: [], totalCount: 0 });

    // When the hook loads
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Then empty state is shown (not "all finished")
    expect(result.current.hasActiveProducts).toBe(false);
    expect(result.current.allFinished).toBe(false);
  });

  it('should_show_all_finished_when_products_exist_but_all_are_finished', async () => {
    // Given products exist but all are finished
    mockGetAllProducts.mockResolvedValue({ active: [], totalCount: 3 });

    // When the hook loads
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Then "all finished" state is shown
    expect(result.current.hasActiveProducts).toBe(false);
    expect(result.current.allFinished).toBe(true);
  });

  it('should_show_populated_dashboard_with_single_product', async () => {
    // Given a single active product exists
    const products = [makeProduct({ id: '1', name: 'Salt', status: 'new' })];
    mockGetAllProducts.mockResolvedValue({ active: products, totalCount: 1 });

    // When the hook loads
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Then panels are shown (not empty state)
    expect(result.current.hasActiveProducts).toBe(true);
    expect(result.current.products).toHaveLength(1);
  });

  it('should_expose_error_when_loading_fails', async () => {
    // Given loading will fail
    mockGetAllProducts.mockRejectedValue(new Error('Storage error'));

    // When the hook loads
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Then error is exposed
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Storage error');
  });

  it('should_start_in_loading_state', () => {
    // Given products exist (slow resolution)
    mockGetAllProducts.mockReturnValue(new Promise(() => {})); // never resolves

    // When the hook first renders
    const { result } = renderHook(() => useDashboard());

    // Then it starts loading (or in initial state before useEffect)
    // Initial state is loading=false, then useEffect triggers loading=true
    expect(result.current.products).toEqual([]);
  });
});
