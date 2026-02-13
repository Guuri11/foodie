import type { ReceiptScanResult } from '../services/receipt-scanner';

export interface ScanReceiptUseCase {
  execute(imageBase64: string): Promise<ReceiptScanResult>;
}
