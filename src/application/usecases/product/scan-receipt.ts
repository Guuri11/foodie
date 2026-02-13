import type { Logger } from '@domain/logger';
import type {
  ReceiptScannerService,
  ReceiptScanResult,
} from '@domain/product/services/receipt-scanner';
import type { ScanReceiptUseCase } from '@domain/product/use-cases/scan-receipt';

export class ScanReceiptUseCaseImpl implements ScanReceiptUseCase {
  constructor(
    private readonly scanner: ReceiptScannerService,
    private readonly logger: Logger
  ) {}

  async execute(imageBase64: string): Promise<ReceiptScanResult> {
    this.logger.info('Scanning receipt');

    const result = await this.scanner.scan(imageBase64);

    this.logger.info('Receipt scanned', { itemCount: result.items.length });

    return result;
  }
}
