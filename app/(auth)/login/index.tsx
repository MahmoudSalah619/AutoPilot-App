import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useSignInMutation } from '@/apis/autopilotApi';
import { sessionStarted } from '@/redux/authReducer';
import { useAppDispatch } from '@/redux';
import { Screen } from '@/shared/components/layout';
import { Button, Checkbox, Divider, FormInput, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { BiometricAuth } from '@/features/auth';
import { EMAIL_RULES, PASSWORD_RULES } from '@/features/auth/validation';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [signIn, { isLoading }] = useSignInMutation();
  const [rememberMe, setRememberMe] = useState(true);

  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const session = await signIn(values).unwrap();
      dispatch(sessionStarted(session));
      router.replace('/(main)/(tabs)/Home');
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.unexpected';
      toast.error(t('auth.errors.invalidCredentials'), t(message, { defaultValue: message }));
    }
  };

  return (
    <Screen
      scroll
      gap="xl"
      header={{ titleTx: 'auth.signIn' }}
      footer={
        <View
          style={{
            alignItems: 'center',
            columnGap: SPACING.xs,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text variant="bodySm" color="textSecondary" tx="auth.noAccount" />
          <Pressable onPress={() => router.replace('/(auth)/signup')} hitSlop={8}>
            <Text variant="label" color="primary" tx="auth.signUp" />
          </Pressable>
        </View>
      }
    >
      <View style={{ rowGap: SPACING.xs }}>
        <Text variant="display" tx="auth.signInTitle" />
        <Text variant="body" color="textSecondary" tx="auth.signInSubtitle" />
      </View>

      <View style={{ rowGap: SPACING.lg }}>
        <FormInput
          control={control}
          name="email"
          labelTx="auth.email"
          placeholderTx="auth.emailPlaceholder"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          required
          rules={EMAIL_RULES}
        />

        <FormInput
          control={control}
          name="password"
          labelTx="auth.password"
          placeholderTx="auth.passwordPlaceholder"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          required
          rules={PASSWORD_RULES}
        />

        <View
          style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <Checkbox value={rememberMe} onChange={setRememberMe} labelTx="auth.rememberMe" />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}>
            <Text variant="labelSm" color="primary" tx="auth.forgotPassword" />
          </Pressable>
        </View>
      </View>

      <Button
        tx="auth.signIn"
        size="lg"
        fullWidth
        loading={isLoading}
        onPress={handleSubmit(onSubmit)}
      />

      <Divider labelTx="auth.orContinueWith" />

      <BiometricAuth />
    </Screen>
  );
}
