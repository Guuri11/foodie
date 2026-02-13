import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Product } from '@domain/product/model';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

import { useAddProduct } from '../use-add-product';

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

describe('useAddProduct', () => {
  let mockGetAllProducts: jest.Mock;
  let mockAddProduct: jest.Mock;

  beforeEach(() => {
    useProductStore.setState({
      products: [],
      totalCount: 0,
      loading: false,
      error: null,
    });

    mockGetAllProducts = jest.fn().mockResolvedValue({ active: [], totalCount: 0 });
    mockAddProduct = jest.fn();

    mockUseUseCases.mockReturnValue({
      getAllProducts: { execute: mockGetAllProducts },
      addProduct: { execute: mockAddProduct },
      updateProduct: { execute: jest.fn() },
      scanReceipt: { execute: jest.fn() },
      identifyProduct: { executeByImage: jest.fn(), executeByBarcode: jest.fn() },
    });
  });

  it('should_start_with_empty_input_and_no_suggestions', () => {
    // Given the hook renders with no prior input
    const { result } = renderHook(() => useAddProduct());

    // Then input is empty and there are no suggestions
    expect(result.current.input).toBe('');
    expect(result.current.suggestions).toEqual([]);
  });

  it('should_show_filtered_suggestions_when_typing', () => {
    // Given the hook is rendered
    const { result } = renderHook(() => useAddProduct());

    // When the user types "le"
    act(() => {
      result.current.setInput('le');
    });

    // Then suggestions include items starting with "le" (e.g. Leche, Lechuga)
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    result.current.suggestions.forEach((name) => {
      expect(name.toLowerCase()).toContain('le');
    });
  });

  it('should_filter_suggestions_case_insensitively', () => {
    // Given the hook is rendered
    const { result } = renderHook(() => useAddProduct());

    // When the user types "LE" (uppercase)
    act(() => {
      result.current.setInput('LE');
    });

    // Then suggestions still match (case-insensitive)
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    result.current.suggestions.forEach((name) => {
      expect(name.toLowerCase()).toContain('le');
    });
  });

  it('should_add_product_and_clear_input_on_submit', async () => {
    // Given the user has typed a product name
    mockAddProduct.mockResolvedValue(makeProduct({ id: '1', name: 'Leche' }));

    const { result } = renderHook(() => useAddProduct());

    act(() => {
      result.current.setInput('Leche');
    });

    // When the user submits the product
    await act(async () => {
      await result.current.addProduct();
    });

    // Then the input is cleared
    expect(result.current.input).toBe('');
  });

  it('should_not_submit_when_input_is_empty', async () => {
    // Given the input is empty
    const { result } = renderHook(() => useAddProduct());

    // When the user tries to add with empty input
    await act(async () => {
      await result.current.addProduct();
    });

    // Then the store addProduct is never called
    expect(mockAddProduct).not.toHaveBeenCalled();
  });

  it('should_show_error_when_adding_fails', async () => {
    // Given adding a product will fail
    mockAddProduct.mockRejectedValue(new Error('Repository error'));

    // Initialize the store so _addProduct is set
    const { result } = renderHook(() => useAddProduct());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setInput('Leche');
    });

    // When the user submits
    await act(async () => {
      await result.current.addProduct();
    });

    // Then the error is surfaced
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Repository error');
  });

  it('should_include_user_history_in_suggestions', async () => {
    // Given the user already has products in the store
    const existingProducts = [
      makeProduct({ id: '1', name: 'Lentejas rojas' }),
      makeProduct({ id: '2', name: 'Manzana' }),
    ];
    useProductStore.setState({ products: existingProducts });

    const { result } = renderHook(() => useAddProduct());

    // When the user types "lent"
    act(() => {
      result.current.setInput('lent');
    });

    // Then "Lentejas rojas" from history appears in suggestions
    expect(result.current.suggestions).toContain('Lentejas rojas');
  });

  it('should_not_show_duplicate_suggestions', async () => {
    // Given a product name exists in both common names and user history
    // "Leche" is in common product names
    const existingProducts = [makeProduct({ id: '1', name: 'Leche' })];
    useProductStore.setState({ products: existingProducts });

    const { result } = renderHook(() => useAddProduct());

    // When the user types "lec"
    act(() => {
      result.current.setInput('lec');
    });

    // Then "Leche" appears only once
    const lecheCount = result.current.suggestions.filter((s) => s === 'Leche').length;
    expect(lecheCount).toBe(1);
  });
});
