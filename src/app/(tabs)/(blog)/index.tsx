import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Screen } from '@/components/ui';
import { BlogIndexScreen } from '@/features/blog';

export default function BlogScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['markdown'] });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <BlogIndexScreen />
    </Screen>
  );
}
