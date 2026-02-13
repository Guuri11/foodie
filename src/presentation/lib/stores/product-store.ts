import { create } from 'zustand';

import type { Product, ProductUpdate } from '@domain/product/model';
import type { AddProductUseCase } from '@domain/product/use-cases/add-product';
import type { GetAllProductsUseCase } from '@domain/product/use-cases/get-all-products';
import type { UpdateProductUseCase } from '@domain/product/use-cases/update-product';
import type { ProductLocation } from '@domain/product/value-objects';

interface ProductState {
  products: Product[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
}

interface ProductActions {
  loadProducts: () => Promise<void>;
  addProduct: (
    name: string,
    options?: { location?: ProductLocation; quantity?: string }
  ) => Promise<void>;
  addProducts: (names: string[]) => Promise<void>;
  updateProduct: (id: string, changes: ProductUpdate) => Promise<void>;
  initialize: (useCases: {
    getAllProducts: GetAllProductsUseCase;
    addProduct: AddProductUseCase;
    updateProduct: UpdateProductUseCase;
  }) => void;
}

type ProductStore = ProductState & ProductActions;

let _getAllProducts: GetAllProductsUseCase | null = null;
let _addProduct: AddProductUseCase | null = null;
let _updateProduct: UpdateProductUseCase | null = null;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  totalCount: 0,
  loading: false,
  error: null,

  initialize: (useCases) => {
    _getAllProducts = useCases.getAllProducts;
    _addProduct = useCases.addProduct;
    _updateProduct = useCases.updateProduct;
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

  addProduct: async (name: string, options?: { location?: ProductLocation; quantity?: string }) => {
    if (!_addProduct) return;
    set({ error: null });
    try {
      await _addProduct.execute(name, options);
      await get().loadProducts();
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error') });
      throw e;
    }
  },

  addProducts: async (names: string[]) => {
    if (!_addProduct) return;
    set({ error: null });

    for (const name of names) {
      try {
        await _addProduct.execute(name);
      } catch {
        // Continue with remaining products on individual failure
      }
    }

    await get().loadProducts();
  },

  updateProduct: async (id: string, changes: ProductUpdate) => {
    if (!_updateProduct) return;
    set({ error: null });
    try {
      await _updateProduct.execute(id, changes);
      await get().loadProducts();
    } catch (e) {
      set({ error: e instanceof Error ? e : new Error('Unknown error') });
      throw e;
    }
  },
}));
