/**
 * GetSuggestionsUseCase Tests
 * 
 * Testing the application layer orchestration for getting cooking suggestions.
 * Following TDD: tests written before implementation.
 */

import type { Logger } from '@domain/logger';
import type { Product } from '@domain/product/model';
import type { ProductRepository } from '@domain/product/repository';
import type { Suggestion } from '@domain/suggestion/model';
import type { SuggestionGeneratorService } from '@domain/suggestion/services/suggestion-generator';
import type { GetSuggestionsUseCase } from '@domain/suggestion/use-cases/get-suggestions';

import { GetSuggestionsUseCaseImpl } from '../get-suggestions';

describe('GetSuggestionsUseCase', () => {
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockSuggestionGenerator: jest.Mocked<SuggestionGeneratorService>;
  let mockLogger: jest.Mocked<Logger>;
  let useCase: GetSuggestionsUseCase;

  // Helper to create a product
  const createProduct = (
    id: string,
    name: string,
    daysUntilExpiry: number | null
  ): Product => ({
    id,
    name,
    status: daysUntilExpiry !== null && daysUntilExpiry <= 2 ? 'opened' : 'new',
    location: 'fridge',
    quantity: undefined,
    expiryDate:
      daysUntilExpiry !== null
        ? new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000)
        : undefined,
    estimatedExpiryDate: undefined,
    outcome: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Helper to create a suggestion
  const createSuggestion = (id: string, title: string): Suggestion => ({
    id,
    title,
    description: undefined,
    estimatedTime: 'quick',
    ingredients: [],
    urgentIngredients: [],
    steps: undefined,
    createdAt: new Date(),
  });

  beforeEach(() => {
    mockProductRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      getActiveProducts: jest.fn(),
    };

    mockSuggestionGenerator = {
      generate: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    useCase = new GetSuggestionsUseCaseImpl(
      mockProductRepository,
      mockSuggestionGenerator,
      mockLogger
    );
  });

  describe('Fetching suggestions', () => {
    it('should_return_suggestions_when_enough_products_exist', async () => {
      // Given we have enough products
      const products = [
        createProduct('1', 'Chicken', 1), // Expiring soon
        createProduct('2', 'Rice', 10), // Fresh
        createProduct('3', 'Tomato', 3), // Medium urgency
      ];
      mockProductRepository.getActiveProducts.mockResolvedValue(products);

      const suggestions = [
        createSuggestion('sug-1', 'Arroz con pollo'),
        createSuggestion('sug-2', 'Chicken salad'),
      ];
      mockSuggestionGenerator.generate.mockResolvedValue(suggestions);

      // When we request suggestions
      const result = await useCase.execute(5);

      // Then we receive suggestions
      expect(result).toEqual(suggestions);
      expect(mockProductRepository.getActiveProducts).toHaveBeenCalledTimes(1);
      expect(mockSuggestionGenerator.generate).toHaveBeenCalledWith(
        expect.any(Array),
        5
      );
    });

    it('should_sort_products_by_urgency_before_generating_suggestions', async () => {
      // Given we have products with different urgencies
      const freshProduct = createProduct('1', 'Rice', 10);
      const expiringProduct = createProduct('2', 'Chicken', 1);
      const mediumProduct = createProduct('3', 'Tomato', 3);

      mockProductRepository.getActiveProducts.mockResolvedValue([
        freshProduct,
        expiringProduct,
        mediumProduct,
      ]);

      mockSuggestionGenerator.generate.mockResolvedValue([
        createSuggestion('sug-1', 'Quick meal'),
      ]);

      // When we request suggestions
      await useCase.execute(5);

      // Then products are sorted by urgency before generation
      const calledProducts =
        mockSuggestionGenerator.generate.mock.calls[0][0] as Product[];
      
      // First product should be the most urgent (expiring)
      expect(calledProducts[0].id).toBe('2'); // Chicken (1 day)
    });

    it('should_limit_results_to_requested_amount_when_more_suggestions_available', async () => {
      // Given we have many products
      const products = [
        createProduct('1', 'A', 1),
        createProduct('2', 'B', 2),
        createProduct('3', 'C', 3),
        createProduct('4', 'D', 4),
        createProduct('5', 'E', 5),
        createProduct('6', 'F', 6),
      ];
      mockProductRepository.getActiveProducts.mockResolvedValue(products);

      // And generator returns many suggestions
      const suggestions = [
        createSuggestion('sug-1', 'Recipe 1'),
        createSuggestion('sug-2', 'Recipe 2'),
        createSuggestion('sug-3', 'Recipe 3'),
        createSuggestion('sug-4', 'Recipe 4'),
        createSuggestion('sug-5', 'Recipe 5'),
        createSuggestion('sug-6', 'Recipe 6'),
        createSuggestion('sug-7', 'Recipe 7'),
      ];
      mockSuggestionGenerator.generate.mockResolvedValue(suggestions);

      // When we request only 3 suggestions
      const result = await useCase.execute(3);

      // Then we receive exactly 3 suggestions
      expect(result).toHaveLength(3);
      expect(result).toEqual(suggestions.slice(0, 3));
    });

    it('should_return_empty_array_when_not_enough_products_exist', async () => {
      // Given we have only 1 product (not enough for suggestions)
      const products = [createProduct('1', 'Salt', null)];
      mockProductRepository.getActiveProducts.mockResolvedValue(products);

      // When we request suggestions
      const result = await useCase.execute(5);

      // Then we receive empty array
      expect(result).toEqual([]);
      expect(mockSuggestionGenerator.generate).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Not enough products for suggestions',
        { count: 1 }
      );
    });

    it('should_return_empty_array_when_no_products_exist', async () => {
      // Given we have no products
      mockProductRepository.getActiveProducts.mockResolvedValue([]);

      // When we request suggestions
      const result = await useCase.execute(5);

      // Then we receive empty array
      expect(result).toEqual([]);
      expect(mockSuggestionGenerator.generate).not.toHaveBeenCalled();
    });

    it('should_use_default_limit_of_5_when_not_specified', async () => {
      // Given we have products
      const products = [
        createProduct('1', 'A', 1),
        createProduct('2', 'B', 2),
        createProduct('3', 'C', 3),
      ];
      mockProductRepository.getActiveProducts.mockResolvedValue(products);

      mockSuggestionGenerator.generate.mockResolvedValue([
        createSuggestion('sug-1', 'Recipe'),
      ]);

      // When we request suggestions without specifying limit
      await useCase.execute();

      // Then default limit of 5 is used
      expect(mockSuggestionGenerator.generate).toHaveBeenCalledWith(
        expect.any(Array),
        5
      );
    });
  });

  describe('Logging', () => {
    it('should_log_operation_when_getting_suggestions', async () => {
      // Given we have products
      const products = [
        createProduct('1', 'Chicken', 1),
        createProduct('2', 'Rice', 10),
      ];
      mockProductRepository.getActiveProducts.mockResolvedValue(products);
      mockSuggestionGenerator.generate.mockResolvedValue([
        createSuggestion('sug-1', 'Arroz con pollo'),
      ]);

      // When we request suggestions
      await useCase.execute(3);

      // Then operation is logged
      expect(mockLogger.info).toHaveBeenCalledWith('Getting suggestions', {
        limit: 3,
      });
    });

    it('should_log_when_not_enough_products_for_suggestions', async () => {
      // Given we have insufficient products
      mockProductRepository.getActiveProducts.mockResolvedValue([
        createProduct('1', 'Salt', null),
      ]);

      // When we request suggestions
      await useCase.execute(5);

      // Then it logs the situation
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Not enough products for suggestions',
        { count: 1 }
      );
    });
  });

  describe('Error handling', () => {
    it('should_propagate_error_when_repository_fails', async () => {
      // Given repository will fail
      const error = new Error('Database error');
      mockProductRepository.getActiveProducts.mockRejectedValue(error);

      // When we request suggestions
      // Then error is propagated
      await expect(useCase.execute(5)).rejects.toThrow('Database error');
    });

    it('should_propagate_error_when_generator_fails', async () => {
      // Given we have products but generator fails
      const products = [
        createProduct('1', 'Chicken', 1),
        createProduct('2', 'Rice', 10),
      ];
      mockProductRepository.getActiveProducts.mockResolvedValue(products);

      const error = new Error('AI service unavailable');
      mockSuggestionGenerator.generate.mockRejectedValue(error);

      // When we request suggestions
      // Then error is propagated
      await expect(useCase.execute(5)).rejects.toThrow('AI service unavailable');
    });
  });
});
