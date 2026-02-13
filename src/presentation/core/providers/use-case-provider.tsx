import { createContext, type ReactNode, useContext, useMemo } from 'react';
import Constants from 'expo-constants';

import type { AddProductUseCase } from '@domain/product/use-cases/add-product';
import type { EstimateExpiryUseCase } from '@domain/product/use-cases/estimate-expiry';
import type { GetAllProductsUseCase } from '@domain/product/use-cases/get-all-products';
import type { IdentifyProductUseCase } from '@domain/product/use-cases/identify-product';
import type { ScanReceiptUseCase } from '@domain/product/use-cases/scan-receipt';
import type { SetProductOutcomeUseCase } from '@domain/product/use-cases/set-product-outcome';
import type { UpdateProductUseCase } from '@domain/product/use-cases/update-product';
import type { UpdateProductStatusUseCase } from '@domain/product/use-cases/update-product-status';

import { AddProductUseCaseImpl } from '@application/usecases/product/add-product';
import { EstimateExpiryUseCaseImpl } from '@application/usecases/product/estimate-expiry';
import { GetAllProductsUseCaseImpl } from '@application/usecases/product/get-all-products';
import { IdentifyProductUseCaseImpl } from '@application/usecases/product/identify-product';
import { ScanReceiptUseCaseImpl } from '@application/usecases/product/scan-receipt';
import { SetProductOutcomeUseCaseImpl } from '@application/usecases/product/set-product-outcome';
import { UpdateProductUseCaseImpl } from '@application/usecases/product/update-product';
import { UpdateProductStatusUseCaseImpl } from '@application/usecases/product/update-product-status';

import { ConsoleLogger } from '@infrastructure/logger/console-logger';
import { ProductRepositoryMemory } from '@infrastructure/repositories/product/product-repository-memory';
import { ExpiryEstimatorOpenAI } from '@infrastructure/services/product/expiry-estimator-openai';
import { ExpiryEstimatorStub } from '@infrastructure/services/product/expiry-estimator-stub';
import { ProductIdentifierOpenAI } from '@infrastructure/services/product/product-identifier-openai';
import { ProductIdentifierStub } from '@infrastructure/services/product/product-identifier-stub';
import { ReceiptScannerOpenAI } from '@infrastructure/services/product/receipt-scanner-openai';
import { ReceiptScannerStub } from '@infrastructure/services/product/receipt-scanner-stub';

export interface UseCases {
  getAllProducts: GetAllProductsUseCase;
  addProduct: AddProductUseCase;
  updateProduct: UpdateProductUseCase;
  updateProductStatus: UpdateProductStatusUseCase;
  setProductOutcome: SetProductOutcomeUseCase;
  estimateExpiry: EstimateExpiryUseCase;
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

    const expiryEstimator =
      openaiApiKey && openaiApiKey.length > 0
        ? new ExpiryEstimatorOpenAI(openaiApiKey)
        : new ExpiryEstimatorStub();

    // Create EstimateExpiryUseCase first (needed by other use cases)
    const estimateExpiry = new EstimateExpiryUseCaseImpl(
      productRepository,
      expiryEstimator,
      logger
    );

    return {
      getAllProducts: new GetAllProductsUseCaseImpl(productRepository, logger),
      addProduct: new AddProductUseCaseImpl(productRepository, logger, estimateExpiry),
      updateProduct: new UpdateProductUseCaseImpl(productRepository, logger, estimateExpiry),
      updateProductStatus: new UpdateProductStatusUseCaseImpl(
        productRepository,
        logger,
        estimateExpiry
      ),
      setProductOutcome: new SetProductOutcomeUseCaseImpl(productRepository, logger),
      estimateExpiry,
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
