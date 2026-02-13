import { act, renderHook } from '@testing-library/react-native';

import { useUseCases } from '~/core/providers/use-case-provider';

import { useProductStore } from '~/lib/stores/product-store';

import { useReceiptScanner } from '../use-receipt-scanner';

jest.mock('~/core/providers/use-case-provider', () => ({
  useUseCases: jest.fn(),
}));

const mockUseUseCases = useUseCases as jest.MockedFunction<typeof useUseCases>;

describe('useReceiptScanner', () => {
  let mockScanReceiptExecute: jest.Mock;
  let mockAddProductExecute: jest.Mock;
  let mockGetAllProductsExecute: jest.Mock;

  beforeEach(() => {
    mockScanReceiptExecute = jest.fn();
    mockAddProductExecute = jest.fn();
    mockGetAllProductsExecute = jest.fn().mockResolvedValue({ active: [], totalCount: 0 });

    mockUseUseCases.mockReturnValue({
      getAllProducts: { execute: mockGetAllProductsExecute },
      addProduct: { execute: mockAddProductExecute },
      scanReceipt: { execute: mockScanReceiptExecute },
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
    });
  });

  it('should_start_in_idle_state', () => {
    // Given the hook renders
    const { result } = renderHook(() => useReceiptScanner());

    // Then it starts idle
    expect(result.current.scanning).toBe(false);
    expect(result.current.scannedItems).toEqual([]);
    expect(result.current.scanError).toBeNull();
  });

  it('should_set_scanning_while_processing', async () => {
    // Given a slow scan
    let resolvePromise: (value: unknown) => void;
    mockScanReceiptExecute.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() => useReceiptScanner());

    // When we start scanning
    let scanPromise: Promise<void>;
    act(() => {
      scanPromise = result.current.captureAndScan('base64data');
    });

    // Then scanning is true
    expect(result.current.scanning).toBe(true);

    // When scan completes
    await act(async () => {
      resolvePromise!({ items: [{ name: 'Leche', confidence: 'high' }] });
      await scanPromise;
    });

    // Then scanning is false
    expect(result.current.scanning).toBe(false);
  });

  it('should_return_scanned_items_after_capture', async () => {
    // Given scanner returns items
    mockScanReceiptExecute.mockResolvedValue({
      items: [
        { name: 'Leche', confidence: 'high' },
        { name: 'Pan', confidence: 'low' },
      ],
    });

    const { result } = renderHook(() => useReceiptScanner());

    // When we capture and scan
    await act(async () => {
      await result.current.captureAndScan('base64data');
    });

    // Then scanned items are available
    expect(result.current.scannedItems).toHaveLength(2);
    expect(result.current.scannedItems[0].name).toBe('Leche');
    expect(result.current.scannedItems[1].confidence).toBe('low');
  });

  it('should_allow_removing_items_from_review', async () => {
    // Given we have scanned items
    mockScanReceiptExecute.mockResolvedValue({
      items: [
        { name: 'Leche', confidence: 'high' },
        { name: 'Pan', confidence: 'high' },
        { name: 'Huevos', confidence: 'high' },
      ],
    });

    const { result } = renderHook(() => useReceiptScanner());

    await act(async () => {
      await result.current.captureAndScan('base64data');
    });

    // When we remove item at index 1
    act(() => {
      result.current.removeItem(1);
    });

    // Then that item is gone
    expect(result.current.scannedItems).toHaveLength(2);
    expect(result.current.scannedItems[0].name).toBe('Leche');
    expect(result.current.scannedItems[1].name).toBe('Huevos');
  });

  it('should_allow_editing_item_names', async () => {
    // Given we have scanned items
    mockScanReceiptExecute.mockResolvedValue({
      items: [{ name: 'Lche', confidence: 'low' }],
    });

    const { result } = renderHook(() => useReceiptScanner());

    await act(async () => {
      await result.current.captureAndScan('base64data');
    });

    // When we edit the item name
    act(() => {
      result.current.editItem(0, 'Leche entera');
    });

    // Then the name is updated
    expect(result.current.scannedItems[0].name).toBe('Leche entera');
  });

  it('should_add_all_confirmed_items_to_store', async () => {
    // Given we have scanned items
    mockScanReceiptExecute.mockResolvedValue({
      items: [
        { name: 'Leche', confidence: 'high' },
        { name: 'Pan', confidence: 'high' },
      ],
    });

    const { result } = renderHook(() => useReceiptScanner());

    await act(async () => {
      await result.current.captureAndScan('base64data');
    });

    // When we confirm
    await act(async () => {
      await result.current.confirmItems();
    });

    // Then addProduct.execute is called for each item
    expect(mockAddProductExecute).toHaveBeenCalledWith('Leche');
    expect(mockAddProductExecute).toHaveBeenCalledWith('Pan');
  });

  it('should_clear_items_after_confirming', async () => {
    // Given we have scanned and confirmed items
    mockScanReceiptExecute.mockResolvedValue({
      items: [{ name: 'Leche', confidence: 'high' }],
    });

    const { result } = renderHook(() => useReceiptScanner());

    await act(async () => {
      await result.current.captureAndScan('base64data');
    });

    await act(async () => {
      await result.current.confirmItems();
    });

    // Then scannedItems is empty
    expect(result.current.scannedItems).toEqual([]);
  });

  it('should_show_error_when_scan_fails', async () => {
    // Given scanner fails
    mockScanReceiptExecute.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useReceiptScanner());

    // When we try to scan
    await act(async () => {
      await result.current.captureAndScan('base64data');
    });

    // Then error is set
    expect(result.current.scanError).toBeTruthy();
    expect(result.current.scanError?.message).toBe('API error');
    expect(result.current.scanning).toBe(false);
  });

  it('should_discard_items_on_cancel', async () => {
    // Given we have scanned items
    mockScanReceiptExecute.mockResolvedValue({
      items: [
        { name: 'Leche', confidence: 'high' },
        { name: 'Pan', confidence: 'high' },
      ],
    });

    const { result } = renderHook(() => useReceiptScanner());

    await act(async () => {
      await result.current.captureAndScan('base64data');
    });

    expect(result.current.scannedItems).toHaveLength(2);

    // When we cancel
    act(() => {
      result.current.cancelReview();
    });

    // Then items are cleared
    expect(result.current.scannedItems).toEqual([]);
    expect(result.current.scanError).toBeNull();
  });
});
