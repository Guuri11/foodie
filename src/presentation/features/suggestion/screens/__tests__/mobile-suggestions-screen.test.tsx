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
        'suggestion.error': "Couldn't get suggestions",
        'suggestion.no_suggestions': 'Add products to get started',
        'dashboard.empty.tagline': 'Your kitchen, with memory.',
        'dashboard.empty.cta_text': 'Start with what you have.',
        'dashboard.empty.add_products': 'Add products',
        'add_product.scan_button': 'Scan receipt',
        'common.retry': 'Try again',
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

    // Then the empty state tagline and scan CTA are visible
    expect(screen.getByText('Your kitchen, with memory.')).toBeTruthy();
    expect(screen.getByText('Scan receipt')).toBeTruthy();
  });

  it('should_show_add_button_in_header_when_suggestions_loaded', () => {
    // Given suggestions are loaded
    mockUseSuggestions.mockReturnValue({
      suggestions: [makeSuggestion({ id: '1', title: 'Pasta' })],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    // When rendering the mobile suggestions screen
    render(<MobileSuggestionsScreen />);

    // Then add button is visible in the header
    expect(screen.getByText('Add')).toBeTruthy();
  });

  it('should_show_add_button_in_header_when_loading', () => {
    // Given the screen is loading
    mockUseSuggestions.mockReturnValue({
      suggestions: [],
      loading: true,
      error: null,
      refresh: jest.fn(),
    });

    // When rendering
    render(<MobileSuggestionsScreen />);

    // Then the header Add button is still accessible
    expect(screen.getByText('Add')).toBeTruthy();
    expect(screen.getByText('Getting ideas...')).toBeTruthy();
  });

  it('should_show_retry_and_add_button_when_error', () => {
    // Given loading fails
    mockUseSuggestions.mockReturnValue({
      suggestions: [],
      loading: false,
      error: new Error('Network error'),
      refresh: jest.fn(),
    });

    // When rendering
    render(<MobileSuggestionsScreen />);

    // Then both the header Add button and a Retry button are visible
    expect(screen.getByText('Add')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
