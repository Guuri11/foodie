export interface PurchaseItem {
  productName: string;
  price?: number;
}

export interface Purchase {
  id: string;
  storeName?: string;
  totalAmount?: number;
  purchasedAt: Date;
  items: PurchaseItem[];
}

export interface CreatePurchaseParams {
  storeName?: string;
  totalAmount?: number;
  items: PurchaseItem[];
}
