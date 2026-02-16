import type { Logger } from '@domain/logger';
import { ProductError } from '@domain/product/errors';
import { createProduct } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';

import { SetProductOutcomeUseCaseImpl } from '../set-product-outcome';

describe('SetProductOutcomeUseCase (H2.5)', () => {
  let mockRepository: jest.Mocked<ProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: SetProductOutcomeUseCaseImpl;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      getActiveProducts: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    useCase = new SetProductOutcomeUseCaseImpl(mockRepository, mockLogger);
  });

  describe('Setting outcome', () => {
    it('should_set_outcome_to_used_when_product_is_finished', async () => {
      // Given a finished product
      const product = createProduct({ id: '1', name: 'Milk', status: 'finished' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we set outcome to 'used'
      const result = await useCase.execute('1', 'used');

      // Then outcome is set
      expect(result.outcome).toBe('used');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should_set_outcome_to_thrown_away_when_product_is_finished', async () => {
      // Given a finished product
      const product = createProduct({ id: '1', name: 'Milk', status: 'finished' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we set outcome to 'thrown_away'
      const result = await useCase.execute('1', 'thrown_away');

      // Then outcome is set
      expect(result.outcome).toBe('thrown_away');
    });

    it('should_clear_outcome_when_null_is_passed', async () => {
      // Given a finished product with an outcome
      const product = createProduct({
        id: '1',
        name: 'Milk',
        status: 'finished',
        outcome: 'used',
      });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we clear the outcome
      const result = await useCase.execute('1', null);

      // Then outcome is cleared (undefined in the model)
      expect(result.outcome).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should_reject_outcome_when_status_is_new', async () => {
      // Given a new product (not finished)
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      mockRepository.getById.mockResolvedValue(product);

      // When we try to set outcome
      // Then it throws validation error
      await expect(useCase.execute('1', 'used')).rejects.toThrow(ProductError);

      try {
        await useCase.execute('1', 'used');
      } catch (e) {
        expect((e as ProductError).code).toBe('outcome_requires_finished_status');
      }
    });

    it('should_reject_outcome_when_status_is_opened', async () => {
      // Given an opened product (not finished)
      const product = createProduct({ id: '1', name: 'Milk', status: 'opened' });
      mockRepository.getById.mockResolvedValue(product);

      // When we try to set outcome
      // Then it throws validation error
      await expect(useCase.execute('1', 'thrown_away')).rejects.toThrow(ProductError);
    });

    it('should_reject_outcome_when_status_is_almost_empty', async () => {
      // Given an almost empty product (not finished)
      const product = createProduct({ id: '1', name: 'Milk', status: 'almost_empty' });
      mockRepository.getById.mockResolvedValue(product);

      // When we try to set outcome
      // Then it throws validation error
      await expect(useCase.execute('1', 'used')).rejects.toThrow(ProductError);
    });

    it('should_allow_clearing_outcome_even_when_status_is_not_finished', async () => {
      // Given a product that is not finished
      const product = createProduct({
        id: '1',
        name: 'Milk',
        status: 'opened',
        outcome: 'used',
      });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we clear the outcome (null)
      const result = await useCase.execute('1', null);

      // Then it succeeds (clearing is always allowed, outcome becomes undefined)
      expect(result.outcome).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should_throw_not_found_when_product_does_not_exist', async () => {
      // Given the product doesn't exist
      mockRepository.getById.mockResolvedValue(null);

      // When we try to set outcome
      // Then it throws not_found error
      await expect(useCase.execute('999', 'used')).rejects.toThrow(ProductError);

      try {
        await useCase.execute('999', 'used');
      } catch (e) {
        expect((e as ProductError).code).toBe('not_found');
      }
    });
  });

  describe('Logging', () => {
    it('should_log_outcome_setting_operation', async () => {
      // Given a finished product
      const product = createProduct({ id: '1', name: 'Milk', status: 'finished' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we set outcome
      await useCase.execute('1', 'used');

      // Then the operation is logged
      expect(mockLogger.info).toHaveBeenCalledWith('Setting product outcome', {
        id: '1',
        outcome: 'used',
      });
    });
  });

  describe('Persistence', () => {
    it('should_persist_updated_product_when_outcome_is_set', async () => {
      // Given a finished product
      const product = createProduct({ id: '1', name: 'Milk', status: 'finished' });
      mockRepository.getById.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(undefined);

      // When we set outcome
      const result = await useCase.execute('1', 'thrown_away');

      // Then the updated product is saved
      expect(mockRepository.save).toHaveBeenCalledWith(result);
    });
  });
});
