import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { createProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type {
  ExpiryEstimation,
  ExpiryEstimatorService,
} from '@domain/product/services/expiry-estimator';

import { EstimateExpiryUseCaseImpl } from '../estimate-expiry';

describe('EstimateExpiryUseCase (H2.3)', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockEstimator: jest.Mocked<ExpiryEstimatorService>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: EstimateExpiryUseCaseImpl;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      getActiveProducts: jest.fn(),
    };
    mockEstimator = {
      estimateExpiryDate: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    useCase = new EstimateExpiryUseCaseImpl(mockRepository, mockEstimator, mockLogger);
  });

  describe('Estimation success', () => {
    it('should_update_estimated_expiry_when_service_returns_date', async () => {
      // Given a product without estimated expiry
      const product = createProduct({ id: '1', name: 'Milk', status: 'opened' });
      const estimatedDate = new Date('2025-02-20');
      const estimation: ExpiryEstimation = { date: estimatedDate, confidence: 'high' };

      mockRepository.getById.mockResolvedValue(product);
      mockEstimator.estimateExpiryDate.mockResolvedValue(estimation);
      mockRepository.save.mockResolvedValue(undefined);

      // When we estimate expiry
      const result = await useCase.execute('1');

      // Then estimated expiry is set
      expect(result.estimatedExpiryDate).toEqual(estimatedDate);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should_consider_product_name_status_and_location_for_estimation', async () => {
      // Given a product with specific characteristics
      const product = createProduct({
        id: '1',
        name: 'Chicken breast',
        status: 'opened',
        location: 'fridge',
      });
      mockRepository.getById.mockResolvedValue(product);
      mockEstimator.estimateExpiryDate.mockResolvedValue({
        date: new Date(),
        confidence: 'high',
      });
      mockRepository.save.mockResolvedValue(undefined);

      // When we estimate expiry
      await useCase.execute('1');

      // Then estimator is called with product details
      expect(mockEstimator.estimateExpiryDate).toHaveBeenCalledWith(
        'Chicken breast',
        'opened',
        'fridge'
      );
    });

    it('should_set_null_when_service_returns_no_date', async () => {
      // Given a product and service returns no estimation
      const product = createProduct({ id: '1', name: 'Unknown item' });
      const estimation: ExpiryEstimation = { date: null, confidence: 'none' };

      mockRepository.getById.mockResolvedValue(product);
      mockEstimator.estimateExpiryDate.mockResolvedValue(estimation);
      mockRepository.save.mockResolvedValue(undefined);

      // When we estimate expiry
      const result = await useCase.execute('1');

      // Then estimated expiry is undefined (no valid estimation)
      expect(result.estimatedExpiryDate).toBeUndefined();
    });
  });

  describe('Manual expiry date preservation', () => {
    it('should_not_override_manual_expiry_date', async () => {
      // Given a product with manual expiry date
      const manualDate = new Date('2025-02-25');
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: manualDate,
      });
      const estimatedDate = new Date('2025-02-20');

      mockRepository.getById.mockResolvedValue(product);
      mockEstimator.estimateExpiryDate.mockResolvedValue({
        date: estimatedDate,
        confidence: 'high',
      });
      mockRepository.save.mockResolvedValue(undefined);

      // When we estimate expiry
      const result = await useCase.execute('1');

      // Then manual expiry date is preserved
      expect(result.expiryDate).toEqual(manualDate);
      // And estimated expiry is updated
      expect(result.estimatedExpiryDate).toEqual(estimatedDate);
    });
  });

  describe('Error handling', () => {
    it('should_throw_not_found_when_product_does_not_exist', async () => {
      // Given the product doesn't exist
      mockRepository.getById.mockResolvedValue(null);

      // When we try to estimate expiry
      // Then it throws not_found error
      await expect(useCase.execute('999')).rejects.toThrow(ProductError);

      try {
        await useCase.execute('999');
      } catch (e) {
        expect((e as ProductError).code).toBe('not_found');
      }
    });

    it('should_fail_gracefully_when_estimator_throws_error', async () => {
      // Given a product and estimator fails
      const product = createProduct({ id: '1', name: 'Milk' });
      mockRepository.getById.mockResolvedValue(product);
      mockEstimator.estimateExpiryDate.mockRejectedValue(new Error('API timeout'));
      mockRepository.save.mockResolvedValue(undefined);

      // When we estimate expiry
      const result = await useCase.execute('1');

      // Then it doesn't throw (fails gracefully) and returns undefined
      expect(result.estimatedExpiryDate).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith('Expiry estimation failed', expect.any(Object));
    });
  });

  describe('Logging', () => {
    it('should_log_estimation_operation_with_confidence', async () => {
      // Given a product
      const product = createProduct({ id: '1', name: 'Milk' });
      const estimation: ExpiryEstimation = {
        date: new Date('2025-02-20'),
        confidence: 'high',
      };

      mockRepository.getById.mockResolvedValue(product);
      mockEstimator.estimateExpiryDate.mockResolvedValue(estimation);
      mockRepository.save.mockResolvedValue(undefined);

      // When we estimate expiry
      await useCase.execute('1');

      // Then the operation is logged with confidence
      expect(mockLogger.info).toHaveBeenCalledWith('Estimating product expiry', { id: '1' });
      expect(mockLogger.info).toHaveBeenCalledWith('Expiry estimated', {
        id: '1',
        confidence: 'high',
        hasDate: true,
      });
    });
  });

  describe('Persistence', () => {
    it('should_persist_updated_product_after_estimation', async () => {
      // Given a product
      const product = createProduct({ id: '1', name: 'Milk' });
      mockRepository.getById.mockResolvedValue(product);
      mockEstimator.estimateExpiryDate.mockResolvedValue({
        date: new Date('2025-02-20'),
        confidence: 'high',
      });
      mockRepository.save.mockResolvedValue(undefined);

      // When we estimate expiry
      const result = await useCase.execute('1');

      // Then the updated product is saved
      expect(mockRepository.save).toHaveBeenCalledWith(result);
    });
  });
});
