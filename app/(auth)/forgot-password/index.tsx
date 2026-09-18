import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useRequestPasswordResetMutation } from '@/apis/autopilotApi';
import { Screen } from '@/shared/components/layout';
import { Button, EmptyState, FormInput, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { EMAIL_RULES } from '@/features/auth/validation';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const [isSent, setIsSent] = useState(false);

  const { control, handleSubmit } = useForm<{ email: string }>({
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      await requestReset(email).unwrap();
      setIsSent(true);
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.unexpected';
      toast.error(t('errors.unexpected'), t(message, { defaultValue: message }));
    }
  };

  if (isSent) {
    return (
      <Screen header={{ titleTx: 'auth.resetPassword' }}>
        <EmptyState
          icon="mail"
          titleTx="auth.resetLinkSent"
          bodyTx="auth.resetPasswordBody"
          actionTx="auth.signIn"
          onAction={() => router.replace('/(auth)/login')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'auth.resetPassword' }}>
      <View style={{ rowGap: SPACING.xs }}>
        <Text variant="display" tx="auth.resetPassword" />
        <Text variant="body" color="textSecondary" tx="auth.resetPasswordBody" />
      </View>

      <FormInput
        control={control}
        name="email"
        labelTx="auth.email"
        placeholderTx="auth.emailPlaceholder"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        required
        rules={EMAIL_RULES}
      />

      <Button
        tx="auth.resetPassword"
        size="lg"
        fullWidth
        loading={isLoading}
        onPress={handleSubmit(onSubmit)}
      />
    </Screen>
  );
}
