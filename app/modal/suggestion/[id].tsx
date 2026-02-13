import { useLocalSearchParams } from 'expo-router';

import { SuggestionDetailScreen } from '~/features/suggestion/screens/suggestion-detail-screen';

export default function SuggestionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <SuggestionDetailScreen suggestionId={id} />;
}
