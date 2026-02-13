/**
 * Suggestion Domain Model
 * 
 * Represents a cooking suggestion generated from available pantry products.
 * Part of Milestone 3: "What should I eat now?" - the star screen.
 */

/**
 * Time range for recipe preparation
 * - quick: ~10 minutes
 * - medium: ~20 minutes
 * - long: ~30+ minutes
 */
export type TimeRange = 'quick' | 'medium' | 'long';

/**
 * Ingredient from user's pantry used in the suggestion
 */
export interface SuggestionIngredient {
  productId: string;
  productName: string;
  quantity?: string;
  isUrgent: boolean; // Product is expiring soon
}

/**
 * Cooking suggestion entity
 * 
 * Business rules:
 * - Must have a clear, concrete title (not generic like "Chicken recipes")
 * - Should prioritize urgent (expiring) ingredients
 * - Must have realistic time estimate
 * - Should be simple enough for tired users
 */
export interface Suggestion {
  id: string;
  title: string; // e.g., "Pasta con el pollo que queda"
  description?: string;
  estimatedTime: TimeRange;
  ingredients: SuggestionIngredient[];
  urgentIngredients: string[]; // Product IDs that are expiring soon
  steps?: string[]; // Brief preparation steps
  createdAt: Date;
}

/**
 * Create a new Suggestion
 * 
 * @throws Error if title is empty
 * @throws Error if no ingredients provided
 */
export function createSuggestion(params: {
  id: string;
  title: string;
  description?: string;
  estimatedTime: TimeRange;
  ingredients: SuggestionIngredient[];
  steps?: string[];
}): Suggestion {
  const { id, title, description, estimatedTime, ingredients, steps } = params;

  // Business validation: title must not be empty
  if (!title.trim()) {
    throw new Error('Suggestion title cannot be empty');
  }

  // Business validation: must have at least one ingredient
  if (ingredients.length === 0) {
    throw new Error('Suggestion must have at least one ingredient');
  }

  // Extract urgent ingredient IDs
  const urgentIngredients = ingredients
    .filter(ing => ing.isUrgent)
    .map(ing => ing.productId);

  return {
    id,
    title: title.trim(),
    description: description?.trim(),
    estimatedTime,
    ingredients,
    urgentIngredients,
    steps,
    createdAt: new Date(),
  };
}

/**
 * Check if suggestion has any urgent ingredients
 */
export function hasUrgentIngredients(suggestion: Suggestion): boolean {
  return suggestion.urgentIngredients.length > 0;
}

/**
 * Get time estimate in minutes
 */
export function getTimeInMinutes(timeRange: TimeRange): number {
  switch (timeRange) {
    case 'quick':
      return 10;
    case 'medium':
      return 20;
    case 'long':
      return 30;
  }
}
