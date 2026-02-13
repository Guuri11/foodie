import type { Logger } from '@domain/logger';
import type { ReceiptScannerService } from '@domain/product/services/receipt-scanner';

import { ScanReceiptUseCaseImpl } from '../scan-receipt';

describe('ScanReceiptUseCase', () => {
  let mockScanner: jest.Mocked<ReceiptScannerService>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: ScanReceiptUseCaseImpl;

  beforeEach(() => {
    mockScanner = {
      scan: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    useCase = new ScanReceiptUseCaseImpl(mockScanner, mockLogger);
  });

  it('should_return_scanned_items_when_receipt_is_valid', async () => {
    // Given a scanner that returns items
    const scanResult = {
      items: [
        { name: 'Leche', confidence: 'high' as const },
        { name: 'Pan', confidence: 'low' as const },
      ],
    };
    mockScanner.scan.mockResolvedValue(scanResult);

    // When we scan a receipt image
    const result = await useCase.execute('base64imagedata');

    // Then the scanned items are returned
    expect(result.items).toEqual(scanResult.items);
    expect(result.items).toHaveLength(2);
  });

  it('should_log_scan_operation_with_item_count', async () => {
    // Given a scanner that returns items
    mockScanner.scan.mockResolvedValue({
      items: [
        { name: 'Leche', confidence: 'high' },
        { name: 'Pan', confidence: 'high' },
        { name: 'Huevos', confidence: 'low' },
      ],
    });

    // When we scan a receipt
    await useCase.execute('base64imagedata');

    // Then the operation is logged with start and result
    expect(mockLogger.info).toHaveBeenCalledWith('Scanning receipt');
    expect(mockLogger.info).toHaveBeenCalledWith('Receipt scanned', { itemCount: 3 });
  });

  it('should_propagate_scanner_errors', async () => {
    // Given a scanner that fails
    mockScanner.scan.mockRejectedValue(new Error('API error'));

    // When we try to scan
    // Then the error surfaces
    await expect(useCase.execute('base64imagedata')).rejects.toThrow('API error');
  });
});
