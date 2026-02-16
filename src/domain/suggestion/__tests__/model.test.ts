/**
 * Suggestion Domain Model Tests
 *
 * Testing business rules and validation for Suggestion entity.
 * Following TDD approach: tests written first.
 */

import {
  createSuggestion,
  getTimeInMinutes,
  hasUrgentIngredients,
  type SuggestionIngredient,
} from '../model';

describe('Suggestion Domain Model', () => {
  describe('createSuggestion', () => {
    describe('Validation', () => {
      it('should_create_valid_suggestion_when_all_required_fields_provided', () => {
        // Given valid suggestion data
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Chicken', isUrgent: true },
          { productId: '2', productName: 'Rice', isUrgent: false },
        ];

        // When creating a suggestion
        const suggestion = createSuggestion({
          id: 'sug-1',
          title: 'Arroz con pollo',
          description: 'Quick and easy chicken rice',
          estimatedTime: 'medium',
          ingredients,
          steps: ['Cook chicken', 'Boil rice', 'Mix together'],
        });

        // Then suggestion is created with correct properties
        expect(suggestion.id).toBe('sug-1');
        expect(suggestion.title).toBe('Arroz con pollo');
        expect(suggestion.description).toBe('Quick and easy chicken rice');
        expect(suggestion.estimatedTime).toBe('medium');
        expect(suggestion.ingredients).toEqual(ingredients);
        expect(suggestion.urgentIngredients).toEqual(['1']); // Only chicken is urgent
        expect(suggestion.steps).toHaveLength(3);
        expect(suggestion.createdAt).toBeInstanceOf(Date);
      });

      it('should_reject_empty_title_when_creating_suggestion', () => {
        // Given a suggestion with empty title
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Chicken', isUrgent: false },
        ];

        // When creating suggestion with empty title
        // Then it should throw an error
        expect(() =>
          createSuggestion({
            id: 'sug-1',
            title: '',
            estimatedTime: 'quick',
            ingredients,
          })
        ).toThrow('Suggestion title cannot be empty');
      });

      it('should_reject_whitespace_only_title_when_creating_suggestion', () => {
        // Given a suggestion with whitespace-only title
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Chicken', isUrgent: false },
        ];

        // When creating suggestion with whitespace title
        // Then it should throw an error
        expect(() =>
          createSuggestion({
            id: 'sug-1',
            title: '   ',
            estimatedTime: 'quick',
            ingredients,
          })
        ).toThrow('Suggestion title cannot be empty');
      });

      it('should_reject_suggestion_without_ingredients', () => {
        // Given a suggestion with no ingredients
        // When creating suggestion
        // Then it should throw an error
        expect(() =>
          createSuggestion({
            id: 'sug-1',
            title: 'Empty recipe',
            estimatedTime: 'quick',
            ingredients: [],
          })
        ).toThrow('Suggestion must have at least one ingredient');
      });

      it('should_trim_title_when_creating_suggestion', () => {
        // Given a suggestion with title with leading/trailing spaces
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Pasta', isUrgent: false },
        ];

        // When creating suggestion
        const suggestion = createSuggestion({
          id: 'sug-1',
          title: '  Pasta carbonara  ',
          estimatedTime: 'quick',
          ingredients,
        });

        // Then title should be trimmed
        expect(suggestion.title).toBe('Pasta carbonara');
      });
    });

    describe('Urgent ingredients extraction', () => {
      it('should_identify_urgent_ingredients_when_creating_suggestion', () => {
        // Given ingredients with mixed urgency
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Milk', isUrgent: true },
          { productId: '2', productName: 'Eggs', isUrgent: true },
          { productId: '3', productName: 'Flour', isUrgent: false },
        ];

        // When creating suggestion
        const suggestion = createSuggestion({
          id: 'sug-1',
          title: 'Crepes',
          estimatedTime: 'quick',
          ingredients,
        });

        // Then urgent ingredients are correctly identified
        expect(suggestion.urgentIngredients).toEqual(['1', '2']);
      });

      it('should_have_empty_urgent_list_when_no_urgent_ingredients', () => {
        // Given ingredients with no urgent items
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Rice', isUrgent: false },
          { productId: '2', productName: 'Beans', isUrgent: false },
        ];

        // When creating suggestion
        const suggestion = createSuggestion({
          id: 'sug-1',
          title: 'Rice and beans',
          estimatedTime: 'medium',
          ingredients,
        });

        // Then urgent ingredients list is empty
        expect(suggestion.urgentIngredients).toEqual([]);
      });
    });

    describe('Optional fields', () => {
      it('should_create_suggestion_without_description_when_not_provided', () => {
        // Given suggestion data without description
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Tomato', isUrgent: false },
        ];

        // When creating suggestion
        const suggestion = createSuggestion({
          id: 'sug-1',
          title: 'Tomato salad',
          estimatedTime: 'quick',
          ingredients,
        });

        // Then description should be undefined
        expect(suggestion.description).toBeUndefined();
      });

      it('should_create_suggestion_without_steps_when_not_provided', () => {
        // Given suggestion data without steps
        const ingredients: SuggestionIngredient[] = [
          { productId: '1', productName: 'Bread', isUrgent: false },
        ];

        // When creating suggestion
        const suggestion = createSuggestion({
          id: 'sug-1',
          title: 'Toast',
          estimatedTime: 'quick',
          ingredients,
        });

        // Then steps should be undefined
        expect(suggestion.steps).toBeUndefined();
      });
    });
  });

  describe('hasUrgentIngredients', () => {
    it('should_return_true_when_suggestion_has_urgent_ingredients', () => {
      // Given a suggestion with urgent ingredients
      const suggestion = createSuggestion({
        id: 'sug-1',
        title: 'Quick meal',
        estimatedTime: 'quick',
        ingredients: [
          { productId: '1', productName: 'Chicken', isUrgent: true },
          { productId: '2', productName: 'Rice', isUrgent: false },
        ],
      });

      // When checking for urgent ingredients
      const result = hasUrgentIngredients(suggestion);

      // Then it should return true
      expect(result).toBe(true);
    });

    it('should_return_false_when_suggestion_has_no_urgent_ingredients', () => {
      // Given a suggestion with no urgent ingredients
      const suggestion = createSuggestion({
        id: 'sug-1',
        title: 'Planned meal',
        estimatedTime: 'medium',
        ingredients: [
          { productId: '1', productName: 'Pasta', isUrgent: false },
          { productId: '2', productName: 'Sauce', isUrgent: false },
        ],
      });

      // When checking for urgent ingredients
      const result = hasUrgentIngredients(suggestion);

      // Then it should return false
      expect(result).toBe(false);
    });
  });

  describe('getTimeInMinutes', () => {
    it('should_return_10_minutes_for_quick_time_range', () => {
      // Given quick time range
      // When getting time in minutes
      const result = getTimeInMinutes('quick');

      // Then it should return 10
      expect(result).toBe(10);
    });

    it('should_return_20_minutes_for_medium_time_range', () => {
      // Given medium time range
      // When getting time in minutes
      const result = getTimeInMinutes('medium');

      // Then it should return 20
      expect(result).toBe(20);
    });

    it('should_return_30_minutes_for_long_time_range', () => {
      // Given long time range
      // When getting time in minutes
      const result = getTimeInMinutes('long');

      // Then it should return 30
      expect(result).toBe(30);
    });
  });
});
