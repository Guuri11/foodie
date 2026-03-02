export interface ReceiptItem {
  name: string;
  confidence: 'high' | 'low';
  price?: number;
}

export interface ReceiptScanResult {
  items: ReceiptItem[];
  storeName?: string;
  totalAmount?: number;
}

export interface ReceiptScannerService {
  scan(imageBase64: string): Promise<ReceiptScanResult>;
}
