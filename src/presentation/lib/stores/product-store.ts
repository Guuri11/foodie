import { create } from 'zustand';

import type { Product } from '@domain/product/model';
import type { AddProductUseCase } from '@domain/product/use-cases/add-product';
import type { GetAllProductsUseCase } from '@domain/product/use-cases/get-all-products';

interface ProductState {
  products: Product[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
}

interface ProductActions {
  loadProducts: () => Promise<void>;
  addProduct: (name: string) => Promise<void>;
  initialize: (useCases: {
    getAllProducts: GetAllProductsUseCase;
    addProduct: AddProductUseCase;
  }) => void;
}

type ProductStore = ProductState & ProductActions;

let _getAllProducts: GetAllProductsUseCase | null = null;
let _addProduct: AddProductUseCase | null = null;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  totalCount: 0,
  loading: false,
  error: null,

  initialize: (useCases) => {
    _getAllProducts = useCases.getAllProducts;
    _addProduct = useCases.addProduct;
  },

  loadProducts: async () => {
    if (!_getAllProducts) return;
    set({ loading: true, error: null });
    try {
      const { active, totalCount } = await _getAllProducts.execute();
      set({ products: active, totalCount, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error'), loading: false });
    }
  },

  addProduct: async (name: string) => {
    if (!_addProduct) return;
    set({ error: null });
    try {
      await _addProduct.execute(name);
      await get().loadProducts();
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error') });
      throw e;
    }
  },
}));
