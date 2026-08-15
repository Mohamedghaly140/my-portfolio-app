import { ScrollView, StyleSheet, View } from "react-native";

import { PromptChip, Text } from "@/components/ui";
import { SUGGESTED_PROMPTS } from "@/features/chat/lib/config";
import { selectionChanged } from "@/lib/haptics";
import { Spacing } from "@/theme";

const WELCOME_INTRO =
  "Hi — I'm Mo Ghaly GPT, Mohamed Ghaly's AI representative. I can answer questions about his frontend and mobile engineering experience, explain relevant projects, and help you decide whether his background may fit your role or product.";

export type WelcomeStateProps = {
  onSelectPrompt: (prompt: string) => void;
};

export function WelcomeState({ onSelectPrompt }: WelcomeStateProps) {
  const prompts = SUGGESTED_PROMPTS.slice(0, 6);

  function handlePromptPress(prompt: string) {
    selectionChanged();
    onSelectPrompt(prompt);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.scroll}
    >
      <Text role="body">{WELCOME_INTRO}</Text>

      <View
        accessibilityLabel="Suggested questions"
        accessibilityRole="summary"
        style={styles.prompts}
      >
        {prompts.map((prompt) => (
          <PromptChip
            key={prompt}
            label={prompt}
            onPress={() => handlePromptPress(prompt)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: Spacing.four,
    justifyContent: "center",
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.five,
  },
  prompts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
});
