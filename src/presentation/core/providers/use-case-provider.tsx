import { createContext, type ReactNode, useContext, useMemo } from 'react';
import Constants from 'expo-constants';

import type { AddProductUseCase } from '@domain/product/use-cases/add-product';
import type { GetAllProductsUseCase } from '@domain/product/use-cases/get-all-products';
import type { IdentifyProductUseCase } from '@domain/product/use-cases/identify-product';
import type { ScanReceiptUseCase } from '@domain/product/use-cases/scan-receipt';
import type { UpdateProductUseCase } from '@domain/product/use-cases/update-product';

import { AddProductUseCaseImpl } from '@application/usecases/product/add-product';
import { GetAllProductsUseCaseImpl } from '@application/usecases/product/get-all-products';
import { IdentifyProductUseCaseImpl } from '@application/usecases/product/identify-product';
import { ScanReceiptUseCaseImpl } from '@application/usecases/product/scan-receipt';
import { UpdateProductUseCaseImpl } from '@application/usecases/product/update-product';

import { ConsoleLogger } from '@infrastructure/logger/console-logger';
import { ProductRepositoryMemory } from '@infrastructure/repositories/product/product-repository-memory';
import { ProductIdentifierOpenAI } from '@infrastructure/services/product/product-identifier-openai';
import { ProductIdentifierStub } from '@infrastructure/services/product/product-identifier-stub';
import { ReceiptScannerOpenAI } from '@infrastructure/services/product/receipt-scanner-openai';
import { ReceiptScannerStub } from '@infrastructure/services/product/receipt-scanner-stub';

export interface UseCases {
  getAllProducts: GetAllProductsUseCase;
  addProduct: AddProductUseCase;
  updateProduct: UpdateProductUseCase;
  scanReceipt: ScanReceiptUseCase;
  identifyProduct: IdentifyProductUseCase;
}

const UseCaseContext = createContext<UseCases | null>(null);

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const useCases = useMemo<UseCases>(() => {
    const logger = new ConsoleLogger();
    const productRepository = new ProductRepositoryMemory();

    const openaiApiKey = Constants.expoConfig?.extra?.openaiApiKey as string | undefined;
    const receiptScanner =
      openaiApiKey && openaiApiKey.length > 0
        ? new ReceiptScannerOpenAI(openaiApiKey)
        : new ReceiptScannerStub();

    const productIdentifier =
      openaiApiKey && openaiApiKey.length > 0
        ? new ProductIdentifierOpenAI(openaiApiKey)
        : new ProductIdentifierStub();

    return {
      getAllProducts: new GetAllProductsUseCaseImpl(productRepository, logger),
      addProduct: new AddProductUseCaseImpl(productRepository, logger),
      updateProduct: new UpdateProductUseCaseImpl(productRepository, logger),
      scanReceipt: new ScanReceiptUseCaseImpl(receiptScanner, logger),
      identifyProduct: new IdentifyProductUseCaseImpl(productIdentifier, logger),
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
