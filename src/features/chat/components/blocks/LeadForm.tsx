import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";

import { Button, Card, Checkbox, Input, Text } from "@/components/ui";
import { useChatConversationId } from "@/features/chat/components/ChatConversationContext";
import { OpportunityTypePicker } from "@/features/chat/components/blocks/lead-form/OpportunityTypePicker";
import { submitLeadFormAttempt } from "@/features/chat/lib/leadFormAttempt";
import type { LeadFormBlock } from "@/features/chat/blocks";
import { lightImpact } from "@/lib/haptics";
import {
  initialLeadFormValues,
  leadFormValuesSchema,
  type LeadDraftResponse,
  type LeadFormValues,
} from "@/types/lead";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/theme-provider";

export type LeadFormProps = {
  block: LeadFormBlock;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const COPY_RESET_MS = 2000;

export function LeadForm({ block }: LeadFormProps) {
  const conversationId = useChatConversationId();
  const { colors } = useTheme();

  const [credentials, setCredentials] = useState<LeadDraftResponse | null>(
    null,
  );
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { control, handleSubmit } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormValuesSchema),
    defaultValues: initialLeadFormValues(block.draft),
  });

  const isSubmitting = submitState === "submitting";
  const isSuccess = submitState === "success";
  const formLocked = isSubmitting || isSuccess;

  async function onSubmit(values: LeadFormValues) {
    setSubmitState("submitting");
    setSubmitError(null);

    const result = await submitLeadFormAttempt({
      conversationId,
      draft: block.draft,
      values,
      cachedCredentials: credentials,
    });

    if (result.status === "success") {
      setCredentials(result.credentials);
      setReference(result.response.lead.reference);
      setSubmitState("success");
      lightImpact();
      return;
    }

    setCredentials(result.credentials);
    setSubmitError(result.message);
    setSubmitState("error");
  }

  function handleCopyReference() {
    if (!reference) return;
    void Clipboard.setStringAsync(reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    });
  }

  function handleOpenPrivacy() {
    router.push("/chat/privacy");
  }

  if (isSuccess && reference) {
    return (
      <Card style={styles.successCard}>
        <Text role="body">
          Your details were submitted to Mohamed. Reference{" "}
          <Text color="code" role="code">
            {reference}
          </Text>
          .
        </Text>
        <Button
          label={copied ? "Copied" : "Copy reference"}
          onPress={handleCopyReference}
          variant="ghost"
        />
      </Card>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.fields}>
        <View style={styles.row}>
          <View style={styles.half}>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  editable={!formLocked}
                  error={fieldState.error?.message}
                  label="Name"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder="Your name"
                  value={field.value}
                />
              )}
            />
          </View>
          <View style={styles.half}>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  autoCapitalize="none"
                  editable={!formLocked}
                  error={fieldState.error?.message}
                  keyboardType="email-address"
                  label="Email"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder="you@example.com"
                  value={field.value}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="company"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="Company"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              optionalHint
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="opportunityType"
          render={({ field, fieldState }) => (
            <OpportunityTypePicker
              error={fieldState.error?.message}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="summary"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="What are you looking for?"
              multiline
              numberOfLines={4}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="technologies"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="Technology stack"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              optionalHint
              placeholder="Flutter, React, TypeScript"
              value={field.value}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Controller
              control={control}
              name="timeline"
              render={({ field, fieldState }) => (
                <Input
                  editable={!formLocked}
                  error={fieldState.error?.message}
                  label="Timeline"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  optionalHint
                  value={field.value}
                />
              )}
            />
          </View>
          <View style={styles.half}>
            <Controller
              control={control}
              name="budgetContext"
              render={({ field, fieldState }) => (
                <Input
                  editable={!formLocked}
                  error={fieldState.error?.message}
                  label="Budget context"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  optionalHint
                  value={field.value}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="projectStage"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="Project stage"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              optionalHint
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="primaryTechnicalProblem"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="Primary technical problem"
              multiline
              numberOfLines={3}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              optionalHint
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="preferredContact"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="Preferred contact"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              optionalHint
              placeholder="Email, phone, or another method"
              value={field.value}
            />
          )}
        />
      </View>

      <View style={styles.privacy}>
        <Text color="textMuted" role="small">
          Privacy notice: submitting will store your contact details and a
          relevant conversation summary and share them with Mohamed so he can
          respond.
        </Text>
        <Pressable
          accessibilityRole="link"
          onPress={handleOpenPrivacy}
        >
          <Text color="accentText" role="small">
            Read the privacy notice
          </Text>
        </Pressable>
        {credentials ? (
          <Text color="textMuted" role="small">
            Privacy notice v{credentials.privacyNoticeVersion}
          </Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="consent"
        render={({ field, fieldState }) => (
          <View style={styles.consent}>
            <Checkbox
              checked={field.value === true}
              disabled={formLocked}
              label="I consent to this storage and sharing as described in the privacy notice above."
              onChange={field.onChange}
            />
            {fieldState.error?.message ? (
              <Text color="danger" role="small">
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      {submitState === "error" && submitError ? (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text color="textMuted" role="small">
            {submitError}
          </Text>
        </View>
      ) : null}

      <Button
        disabled={formLocked}
        label="Submit to Mohamed"
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        variant="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.four,
  },
  fields: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  half: {
    flex: 1,
  },
  privacy: {
    gap: Spacing.one,
  },
  consent: {
    gap: Spacing.one,
  },
  errorBox: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  successCard: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
