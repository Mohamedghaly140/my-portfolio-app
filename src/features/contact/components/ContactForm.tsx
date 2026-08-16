import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Input, Text } from "@/components/ui";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/features/contact/types";
import { submitContact } from "@/lib/api/contact";
import { lightImpact } from "@/lib/haptics";
import { Spacing } from "@/theme";

type SubmitState = "idle" | "submitting" | "success" | "error";

const KEYBOARD_VERTICAL_OFFSET = Platform.OS === "ios" ? 100 : 0;

export function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, setError } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const isSubmitting = submitState === "submitting";
  const isSuccess = submitState === "success";
  const formLocked = isSubmitting || isSuccess;

  async function onSubmit(values: ContactFormValues) {
    setSubmitState("submitting");
    setSubmitError(null);

    const result = await submitContact(values);

    if (result.ok) {
      lightImpact();
      setSubmitState("success");
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (
          message &&
          (field === "name" ||
            field === "email" ||
            field === "subject" ||
            field === "message")
        ) {
          setError(field, { message });
        }
      }
    }

    setSubmitError(result.message);
    setSubmitState("error");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
      style={styles.root}
    >
      <View style={styles.fields}>
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
        <Controller
          control={control}
          name="subject"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="Subject"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              optionalHint
              placeholder="What is this about?"
              value={field.value ?? ""}
            />
          )}
        />
        <Controller
          control={control}
          name="message"
          render={({ field, fieldState }) => (
            <Input
              editable={!formLocked}
              error={fieldState.error?.message}
              label="Message"
              multiline
              numberOfLines={5}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Your message"
              value={field.value}
            />
          )}
        />
      </View>

      <View style={styles.actions}>
        <Button
          disabled={formLocked}
          icon={{ name: "arrow-forward" }}
          label={isSubmitting ? "Sending..." : "Send Message"}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
        />
        {isSuccess ? (
          <Text color="accentText" role="small">
            Message sent!
          </Text>
        ) : null}
        {submitState === "error" && submitError ? (
          <Text color="danger" role="small">
            {submitError}
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: Spacing.five,
  },
  fields: {
    gap: Spacing.three,
  },
  actions: {
    alignItems: "flex-start",
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
});
