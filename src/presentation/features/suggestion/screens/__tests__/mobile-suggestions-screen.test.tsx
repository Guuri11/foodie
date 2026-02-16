import { render, screen } from '@testing-library/react-native';

import type { Suggestion } from '@domain/suggestion/model';

import { useSuggestions } from '../../hooks/use-suggestions';
import { MobileSuggestionsScreen } from '../mobile-suggestions-screen';

jest.mock('../../hooks/use-suggestions');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dashboard.suggestions.title': 'What should I eat?',
        'dashboard.header.add_button': 'Add',
        'suggestion.loading': 'Getting ideas...',
        'suggestion.no_suggestions': 'Add products to get started',
        'dashboard.empty.tagline': 'Your kitchen, with memory.',
        'dashboard.empty.cta_text': 'Start with what you have.',
        'dashboard.empty.add_products': 'Add products',
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockUseSuggestions = useSuggestions as jest.MockedFunction<typeof useSuggestions>;

const now = new Date();

function makeSuggestion(
  overrides: Partial<Suggestion> & { id: string; title: string }
): Suggestion {
  return {
    estimatedTime: 'quick',
    ingredients: [{ productId: '1', productName: 'Milk', isUrgent: false }],
    urgentIngredients: [],
    createdAt: now,
    ...overrides,
  };
}

describe('MobileSuggestionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should_show_suggestions_when_loaded', () => {
    // Given suggestions are loaded
    const suggestions = [
      makeSuggestion({ id: '1', title: 'Pasta with leftover chicken' }),
      makeSuggestion({ id: '2', title: 'Quick veggie stir-fry' }),
    ];
    mockUseSuggestions.mockReturnValue({
      suggestions,
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    // When rendering the mobile suggestions screen
    render(<MobileSuggestionsScreen />);

    // Then suggestions are displayed
    expect(screen.getByText('Pasta with leftover chicken')).toBeTruthy();
    expect(screen.getByText('Quick veggie stir-fry')).toBeTruthy();
  });

  it('should_show_empty_state_when_no_suggestions', () => {
    // Given no suggestions exist
    mockUseSuggestions.mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    // When rendering the mobile suggestions screen
    render(<MobileSuggestionsScreen />);

    // Then empty state is displayed
    expect(screen.getByText('Add products to get started')).toBeTruthy();
  });

  it('should_show_add_button', () => {
    // Given suggestions are loaded
    mockUseSuggestions.mockReturnValue({
      suggestions: [makeSuggestion({ id: '1', title: 'Pasta' })],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    // When rendering the mobile suggestions screen
    render(<MobileSuggestionsScreen />);

    // Then add button is visible
    expect(screen.getByText('Add')).toBeTruthy();
  });
});
