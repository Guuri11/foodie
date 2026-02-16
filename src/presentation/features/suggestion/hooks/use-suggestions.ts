/**
 * useSuggestions Hook
 *
 * Hook to fetch and manage cooking suggestions.
 * Uses DI to access GetSuggestionsUseCase.
 *
 * Part of Milestone 3: H3.1, H3.2, H3.3, H3.4
 */

import { useCallback, useEffect, useState } from 'react';

import type { Suggestion } from '@domain/suggestion/model';

import { useUseCases } from '~/core/providers/use-case-provider';

interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSuggestions(): UseSuggestionsReturn {
  const { getSuggestions } = useUseCases();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSuggestions.execute(5); // Max 5 suggestions (H3.1)
      setSuggestions(result);
    } catch (err) {
      setError(err as Error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [getSuggestions]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refresh: loadSuggestions,
  };
}
