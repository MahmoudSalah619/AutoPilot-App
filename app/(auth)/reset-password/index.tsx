import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useUpdatePasswordMutation } from '@/apis/autopilotApi';
import { useSession } from '@/hooks/useSession';
import { Screen } from '@/shared/components/layout';
import { Button, EmptyState, FormInput, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { NEW_PASSWORD_RULES } from '@/features/auth/validation';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

/**
 * Sets a new password after a recovery link.
 *
 * Reached only from the deep-link handler, which has already exchanged the
 * link's code for a session — that session is what authorises the change.
 * Landing here without one means the link was opened on another device or
 * has already been used, so the screen says so rather than showing a form
 * that cannot submit.
 */
export default function ResetPassword() {
  const { t } = useTranslation();
  const { isHydrated, isAuthenticated } = useSession();
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const { control, handleSubmit, watch } = useForm<ResetPasswordForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (values: ResetPasswordForm) => {
    try {
      await updatePassword(values.password).unwrap();
      toast.success(t('auth.passwordUpdated'));
      router.replace('/(main)/(tabs)/Home');
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  if (isHydrated && !isAuthenticated) {
    return (
      <Screen header={{ titleTx: 'auth.resetPassword' }}>
        <EmptyState
          icon="alert-circle"
          titleTx="auth.errors.linkExpired"
          bodyTx="auth.resetLinkExpiredBody"
          actionTx="auth.resetPassword"
          onAction={() => router.replace('/(auth)/forgot-password')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'auth.resetPassword' }}>
      <View style={{ rowGap: SPACING.xs }}>
        <Text variant="display" tx="auth.newPasswordTitle" />
        <Text variant="body" color="textSecondary" tx="auth.newPasswordBody" />
      </View>

      <View style={{ rowGap: SPACING.lg }}>
        <FormInput
          control={control}
          name="password"
          labelTx="auth.newPassword"
          placeholderTx="auth.passwordPlaceholder"
          secureTextEntry
          textContentType="newPassword"
          required
          rules={NEW_PASSWORD_RULES}
        />

        <FormInput
          control={control}
          name="confirmPassword"
          labelTx="auth.confirmPassword"
          secureTextEntry
          textContentType="newPassword"
          required
          rules={{
            validate: (value: string) => value === password || 'validation.passwordsDoNotMatch',
          }}
        />
      </View>

      <Button
        tx="auth.savePassword"
        size="lg"
        fullWidth
        loading={isLoading}
        onPress={handleSubmit(onSubmit)}
      />
    </Screen>
  );
}
