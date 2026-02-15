import { act, renderHook } from '@testing-library/react-native';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

import { useProductScanner } from '../use-product-scanner';

jest.mock('~/core/providers/use-case-provider', () => ({
  useUseCases: jest.fn(),
}));

const mockUseUseCases = useUseCases as jest.MockedFunction<typeof useUseCases>;

describe('useProductScanner', () => {
  let mockIdentifyByImage: jest.Mock;
  let mockIdentifyByBarcode: jest.Mock;
  let mockAddProductExecute: jest.Mock;
  let mockGetAllProductsExecute: jest.Mock;

  beforeEach(() => {
    mockIdentifyByImage = jest.fn();
    mockIdentifyByBarcode = jest.fn();
    mockAddProductExecute = jest.fn();
    mockGetAllProductsExecute = jest.fn().mockResolvedValue({ active: [], totalCount: 0 });

    mockUseUseCases.mockReturnValue({
      getAllProducts: { execute: mockGetAllProductsExecute },
      addProduct: { execute: mockAddProductExecute },
      updateProduct: { execute: jest.fn() },
      updateProductStatus: { execute: jest.fn() },
      setProductOutcome: { execute: jest.fn() },
      estimateExpiry: { execute: jest.fn() },
      scanReceipt: { execute: jest.fn() },
      identifyProduct: {
        executeByImage: mockIdentifyByImage,
        executeByBarcode: mockIdentifyByBarcode,
      },
      getSuggestions: { execute: jest.fn() },
      getShoppingItems: { execute: jest.fn() },
      addShoppingItem: { execute: jest.fn() },
      toggleShoppingItem: { execute: jest.fn() },
      deleteShoppingItem: { execute: jest.fn() },
      clearBoughtItems: { execute: jest.fn() },
    });

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

  it('should_start_in_idle_state', () => {
    // Given the hook renders
    const { result } = renderHook(() => useProductScanner());

    // Then it starts idle
    expect(result.current.identifying).toBe(false);
    expect(result.current.identifiedProduct).toBeNull();
    expect(result.current.scanError).toBeNull();
  });

  it('should_set_identifying_while_processing_image', async () => {
    // Given a slow identification
    let resolvePromise: (value: unknown) => void;
    mockIdentifyByImage.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() => useProductScanner());

    // When we start identifying by image
    let identifyPromise: Promise<void>;
    act(() => {
      identifyPromise = result.current.identifyByImage('base64data');
    });

    // Then identifying is true
    expect(result.current.identifying).toBe(true);

    // When identification completes
    await act(async () => {
      resolvePromise!({ name: 'Yogur natural', confidence: 'high', method: 'visual' });
      await identifyPromise;
    });

    // Then identifying is false
    expect(result.current.identifying).toBe(false);
  });

  it('should_return_product_after_image_identification', async () => {
    // Given the identifier recognizes a product by image
    mockIdentifyByImage.mockResolvedValue({
      name: 'Yogur natural',
      confidence: 'high',
      method: 'visual',
    });

    const { result } = renderHook(() => useProductScanner());

    // When we identify by image
    await act(async () => {
      await result.current.identifyByImage('base64data');
    });

    // Then the product is available
    expect(result.current.identifiedProduct).toEqual({
      name: 'Yogur natural',
      confidence: 'high',
      method: 'visual',
    });
  });

  it('should_return_product_after_barcode_scan', async () => {
    // Given the identifier finds a product by barcode
    mockIdentifyByBarcode.mockResolvedValue({
      name: 'Leche entera',
      confidence: 'high',
      method: 'barcode',
    });

    const { result } = renderHook(() => useProductScanner());

    // When we identify by barcode
    await act(async () => {
      await result.current.identifyByBarcode('8410000810004');
    });

    // Then the product is available
    expect(result.current.identifiedProduct).toEqual({
      name: 'Leche entera',
      confidence: 'high',
      method: 'barcode',
    });
  });

  it('should_allow_editing_product_name', async () => {
    // Given we have an identified product
    mockIdentifyByImage.mockResolvedValue({
      name: 'Yogur',
      confidence: 'low',
      method: 'visual',
    });

    const { result } = renderHook(() => useProductScanner());

    await act(async () => {
      await result.current.identifyByImage('base64data');
    });

    // When we edit the product name
    act(() => {
      result.current.editProductName('Leche entera');
    });

    // Then the name is updated
    expect(result.current.identifiedProduct?.name).toBe('Leche entera');
  });

  it('should_add_confirmed_product_to_store', async () => {
    // Given we have an identified product
    mockIdentifyByBarcode.mockResolvedValue({
      name: 'Leche entera',
      confidence: 'high',
      method: 'barcode',
    });

    const { result } = renderHook(() => useProductScanner());

    await act(async () => {
      await result.current.identifyByBarcode('8410000810004');
    });

    // When we confirm
    await act(async () => {
      await result.current.confirmProduct();
    });

    // Then addProduct.execute is called with the product name
    expect(mockAddProductExecute).toHaveBeenCalledWith('Leche entera', undefined);
  });

  it('should_clear_state_after_confirming', async () => {
    // Given we have confirmed a product
    mockIdentifyByImage.mockResolvedValue({
      name: 'Yogur natural',
      confidence: 'high',
      method: 'visual',
    });

    const { result } = renderHook(() => useProductScanner());

    await act(async () => {
      await result.current.identifyByImage('base64data');
    });

    await act(async () => {
      await result.current.confirmProduct();
    });

    // Then identifiedProduct is cleared
    expect(result.current.identifiedProduct).toBeNull();
  });

  it('should_show_error_when_identification_fails', async () => {
    // Given identification fails
    mockIdentifyByImage.mockRejectedValue(new Error('OpenAI API error'));

    const { result } = renderHook(() => useProductScanner());

    // When we try to identify
    await act(async () => {
      await result.current.identifyByImage('base64data');
    });

    // Then error is set
    expect(result.current.scanError).toBeTruthy();
    expect(result.current.scanError?.message).toBe('OpenAI API error');
    expect(result.current.identifying).toBe(false);
  });

  it('should_discard_on_cancel', async () => {
    // Given we have an identified product
    mockIdentifyByImage.mockResolvedValue({
      name: 'Yogur natural',
      confidence: 'high',
      method: 'visual',
    });

    const { result } = renderHook(() => useProductScanner());

    await act(async () => {
      await result.current.identifyByImage('base64data');
    });

    expect(result.current.identifiedProduct).not.toBeNull();

    // When we cancel
    act(() => {
      result.current.cancelIdentification();
    });

    // Then state is cleared
    expect(result.current.identifiedProduct).toBeNull();
    expect(result.current.scanError).toBeNull();
  });

  it('should_reset_for_new_scan', async () => {
    // Given we have an error from a failed scan
    mockIdentifyByImage.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useProductScanner());

    await act(async () => {
      await result.current.identifyByImage('base64data');
    });

    expect(result.current.scanError).not.toBeNull();

    // When we reset
    act(() => {
      result.current.reset();
    });

    // Then all state is cleared
    expect(result.current.identifying).toBe(false);
    expect(result.current.identifiedProduct).toBeNull();
    expect(result.current.scanError).toBeNull();
  });
});
