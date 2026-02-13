import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { createProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { EstimateExpiryUseCase } from '@domain/product/use-cases/estimate-expiry';

import { UpdateProductStatusUseCaseImpl } from '../update-product-status';

describe('UpdateProductStatusUseCase (H2.1)', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockEstimateExpiry: jest.Mocked<EstimateExpiryUseCase>;
  let useCase: UpdateProductStatusUseCaseImpl;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      getActiveProducts: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    mockEstimateExpiry = {
      execute: jest.fn(),
    };
    useCase = new UpdateProductStatusUseCaseImpl(mockRepository, mockLogger, mockEstimateExpiry);
  });

  describe('Status transitions', () => {
    it('should_update_status_to_opened_when_product_is_new', async () => {
      // Given a new product
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we mark it as opened
      const result = await useCase.execute('1', 'opened');

      // Then status changes to opened
      expect(result.status).toBe('opened');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should_update_status_to_almost_empty_when_product_is_opened', async () => {
      // Given an opened product
      const product = createProduct({ id: '1', name: 'Milk', status: 'opened' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we mark it as almost empty
      const result = await useCase.execute('1', 'almost_empty');

      // Then status changes to almost_empty
      expect(result.status).toBe('almost_empty');
    });

    it('should_update_status_to_finished_when_product_is_almost_empty', async () => {
      // Given an almost empty product
      const product = createProduct({ id: '1', name: 'Milk', status: 'almost_empty' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we mark it as finished
      const result = await useCase.execute('1', 'finished');

      // Then status changes to finished
      expect(result.status).toBe('finished');
    });

    it('should_allow_reversing_status_from_finished_to_opened', async () => {
      // Given a finished product
      const product = createProduct({ id: '1', name: 'Milk', status: 'finished' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we revert it to opened
      const result = await useCase.execute('1', 'opened');

      // Then status changes back to opened
      expect(result.status).toBe('opened');
    });

    it('should_allow_direct_transition_from_new_to_finished', async () => {
      // Given a new product
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we mark it directly as finished
      const result = await useCase.execute('1', 'finished');

      // Then status changes to finished
      expect(result.status).toBe('finished');
    });
  });

  describe('Error handling', () => {
    it('should_throw_not_found_when_product_does_not_exist', async () => {
      // Given the product doesn't exist
      mockRepository.getById.mockResolvedValue(null);

      // When we try to update status
      // Then it throws not_found error
      await expect(useCase.execute('999', 'opened')).rejects.toThrow(ProductError);

      try {
        await useCase.execute('999', 'opened');
      } catch (e) {
        expect((e as ProductError).code).toBe('not_found');
      }
    });
  });

  describe('Logging', () => {
    it('should_log_status_update_operation', async () => {
      // Given a product exists
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we update status
      await useCase.execute('1', 'opened');

      // Then the operation is logged
      expect(mockLogger.info).toHaveBeenCalledWith('Updating product status', {
        id: '1',
        status: 'opened',
      });
    });
  });

  describe('Persistence', () => {
    it('should_persist_updated_product_when_status_changes', async () => {
      // Given a product exists
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we update status
      const result = await useCase.execute('1', 'opened');

      // Then the updated product is saved
      expect(mockRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('Automatic expiry re-estimation (H2.3)', () => {
    it('should_re_estimate_expiry_when_status_changes', async () => {
      // Given a product with status 'new'
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);
      const updatedProduct = { ...product, status: 'opened' };
      mockEstimateExpiry.execute.mockResolvedValue(updatedProduct as any);

      // When we change status to 'opened'
      await useCase.execute('1', 'opened');

      // Then expiry is re-estimated
      expect(mockEstimateExpiry.execute).toHaveBeenCalledWith('1');
    });

    it('should_not_block_status_change_when_estimation_fails', async () => {
      // Given a product exists
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);
      mockEstimateExpiry.execute.mockRejectedValue(new Error('API unavailable'));

      // When we change status
      const result = await useCase.execute('1', 'opened');

      // Then status is still updated successfully
      expect(result.status).toBe('opened');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should_re_estimate_when_transitioning_to_finished', async () => {
      // Given an almost empty product
      const product = createProduct({ id: '1', name: 'Milk', status: 'almost_empty' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);
      const finishedProduct = { ...product, status: 'finished' };
      mockEstimateExpiry.execute.mockResolvedValue(finishedProduct as any);

      // When we mark it as finished
      await useCase.execute('1', 'finished');

      // Then expiry is re-estimated
      expect(mockEstimateExpiry.execute).toHaveBeenCalledWith('1');
    });
  });
});
