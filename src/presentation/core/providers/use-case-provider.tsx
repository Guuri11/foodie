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
import type { AddShoppingItemUseCase } from '@domain/shopping-item/use-cases/add-shopping-item';
import type { ClearBoughtItemsUseCase } from '@domain/shopping-item/use-cases/clear-bought-items';
import type { DeleteShoppingItemUseCase } from '@domain/shopping-item/use-cases/delete-shopping-item';
import type { GetShoppingItemsUseCase } from '@domain/shopping-item/use-cases/get-shopping-items';
import type { ToggleShoppingItemUseCase } from '@domain/shopping-item/use-cases/toggle-shopping-item';
import type { GetSuggestionsUseCase } from '@domain/suggestion/use-cases/get-suggestions';

import { AddProductUseCaseImpl } from '@application/usecases/product/add-product';
import { EstimateExpiryUseCaseImpl } from '@application/usecases/product/estimate-expiry';
import { GetAllProductsUseCaseImpl } from '@application/usecases/product/get-all-products';
import { IdentifyProductUseCaseImpl } from '@application/usecases/product/identify-product';
import { ScanReceiptUseCaseImpl } from '@application/usecases/product/scan-receipt';
import { SetProductOutcomeUseCaseImpl } from '@application/usecases/product/set-product-outcome';
import { UpdateProductUseCaseImpl } from '@application/usecases/product/update-product';
import { UpdateProductStatusUseCaseImpl } from '@application/usecases/product/update-product-status';
import { AddShoppingItemUseCaseImpl } from '@application/usecases/shopping-item/add-shopping-item';
import { ClearBoughtItemsUseCaseImpl } from '@application/usecases/shopping-item/clear-bought-items';
import { DeleteShoppingItemUseCaseImpl } from '@application/usecases/shopping-item/delete-shopping-item';
import { GetShoppingItemsUseCaseImpl } from '@application/usecases/shopping-item/get-shopping-items';
import { ToggleShoppingItemUseCaseImpl } from '@application/usecases/shopping-item/toggle-shopping-item';
import { GetSuggestionsUseCaseImpl } from '@application/usecases/suggestion/get-suggestions';

import { ConsoleLogger } from '@infrastructure/logger/console-logger';
import { ProductRepositoryHttp } from '@infrastructure/repositories/product/product-repository-http';
import { ShoppingItemRepositoryHttp } from '@infrastructure/repositories/shopping-item/shopping-item-repository-http';
import { ExpiryEstimatorBackend } from '@infrastructure/services/product/expiry-estimator-backend';
import { ProductIdentifierBackend } from '@infrastructure/services/product/product-identifier-backend';
import { ReceiptScannerBackend } from '@infrastructure/services/product/receipt-scanner-backend';
import { SuggestionGeneratorBackend } from '@infrastructure/services/suggestion/suggestion-generator-backend';

export interface UseCases {
  getAllProducts: GetAllProductsUseCase;
  addProduct: AddProductUseCase;
  updateProduct: UpdateProductUseCase;
  updateProductStatus: UpdateProductStatusUseCase;
  setProductOutcome: SetProductOutcomeUseCase;
  estimateExpiry: EstimateExpiryUseCase;
  scanReceipt: ScanReceiptUseCase;
  identifyProduct: IdentifyProductUseCase;
  getSuggestions: GetSuggestionsUseCase;
  getShoppingItems: GetShoppingItemsUseCase;
  addShoppingItem: AddShoppingItemUseCase;
  toggleShoppingItem: ToggleShoppingItemUseCase;
  deleteShoppingItem: DeleteShoppingItemUseCase;
  clearBoughtItems: ClearBoughtItemsUseCase;
}

const UseCaseContext = createContext<UseCases | null>(null);

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const useCases = useMemo<UseCases>(() => {
    const logger = new ConsoleLogger();
    const apiBaseUrl =
      (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? 'http://localhost:8080';
    const productRepository = new ProductRepositoryHttp(apiBaseUrl);
    const shoppingItemRepository = new ShoppingItemRepositoryHttp(apiBaseUrl);

    const receiptScanner = new ReceiptScannerBackend(apiBaseUrl);
    const productIdentifier = new ProductIdentifierBackend(apiBaseUrl);
    const expiryEstimator = new ExpiryEstimatorBackend(apiBaseUrl);
    const suggestionGenerator = new SuggestionGeneratorBackend(apiBaseUrl);

    // Create EstimateExpiryUseCase first (needed by other use cases)
    const estimateExpiry = new EstimateExpiryUseCaseImpl(
      productRepository,
      expiryEstimator,
      logger
    );

    return {
      getAllProducts: new GetAllProductsUseCaseImpl(productRepository, logger),
      addProduct: new AddProductUseCaseImpl(productRepository, logger),
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
      getSuggestions: new GetSuggestionsUseCaseImpl(productRepository, suggestionGenerator, logger),
      getShoppingItems: new GetShoppingItemsUseCaseImpl(shoppingItemRepository, logger),
      addShoppingItem: new AddShoppingItemUseCaseImpl(shoppingItemRepository, logger),
      toggleShoppingItem: new ToggleShoppingItemUseCaseImpl(shoppingItemRepository, logger),
      deleteShoppingItem: new DeleteShoppingItemUseCaseImpl(shoppingItemRepository, logger),
      clearBoughtItems: new ClearBoughtItemsUseCaseImpl(shoppingItemRepository, logger),
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
