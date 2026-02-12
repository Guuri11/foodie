import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { AddProductUseCase } from '@domain/product/use-cases/add-product';
import type { GetAllProductsUseCase } from '@domain/product/use-cases/get-all-products';

import { AddProductUseCaseImpl } from '@application/usecases/product/add-product';
import { GetAllProductsUseCaseImpl } from '@application/usecases/product/get-all-products';

import { ConsoleLogger } from '@infrastructure/logger/console-logger';
import { ProductRepositoryMemory } from '@infrastructure/repositories/product/product-repository-memory';

export interface UseCases {
  getAllProducts: GetAllProductsUseCase;
  addProduct: AddProductUseCase;
}

const UseCaseContext = createContext<UseCases | null>(null);

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const useCases = useMemo<UseCases>(() => {
    const logger = new ConsoleLogger();
    const productRepository = new ProductRepositoryMemory();

    return {
      getAllProducts: new GetAllProductsUseCaseImpl(productRepository, logger),
      addProduct: new AddProductUseCaseImpl(productRepository, logger),
    };
  }, []);

  return <UseCaseContext.Provider value={useCases}>{children}</UseCaseContext.Provider>;
}

export function useUseCases(): UseCases {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error('useUseCases must be used within UseCaseProvider');
  }
  return context;
}
