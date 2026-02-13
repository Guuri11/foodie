export interface ReceiptItem {
  name: string;
  confidence: 'high' | 'low';
}

export interface ReceiptScanResult {
  items: ReceiptItem[];
}

export interface ReceiptScannerService {
  scan(imageBase64: string): Promise<ReceiptScanResult>;
}
