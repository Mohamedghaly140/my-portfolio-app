import { useEffect, useLayoutEffect, useRef } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';

import { ChatHeaderActions } from '@/features/chat/components/ChatHeaderActions';
import { ChatShell } from '@/features/chat/components/ChatShell';
import { useChatSession } from '@/features/chat/hooks/useChatSession';
import { parseSeedQuestion } from '@/features/chat/lib/seedQuestion';

export default function ChatScreen() {
  const session = useChatSession();
  const { bootState, newChat, isStartingNewChat, sendMessage } = session;
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ q?: string }>();
  const seededRef = useRef(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ChatHeaderActions
          isStartingNewChat={isStartingNewChat}
          newChat={newChat}
        />
      ),
    });
  }, [navigation, newChat, isStartingNewChat]);

  useEffect(() => {
    if (seededRef.current) return;
    if (bootState.phase !== 'ready') return;

    const seed = parseSeedQuestion(
      typeof params.q === 'string' ? params.q : undefined,
    );
    if (!seed) return;

    seededRef.current = true;
    sendMessage(seed);
    router.setParams({ q: undefined });
  }, [bootState.phase, params.q, sendMessage]);

  return <ChatShell session={session} />;
}
