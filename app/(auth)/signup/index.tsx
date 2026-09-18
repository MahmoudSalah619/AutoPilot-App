import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useSignUpMutation } from '@/apis/autopilotApi';
import { sessionStarted } from '@/redux/authReducer';
import { useAppDispatch } from '@/redux';
import { Screen } from '@/shared/components/layout';
import { Button, FormInput, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { EMAIL_RULES, NEW_PASSWORD_RULES } from '@/features/auth/validation';
import { markFirstRunPending } from '@/features/onboarding';

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [signUp, { isLoading }] = useSignUpMutation();

  const { control, handleSubmit, watch } = useForm<SignUpForm>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (values: SignUpForm) => {
    try {
      const session = await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      }).unwrap();

      dispatch(sessionStarted(session));

      // Only a newly created account is a first-time user, so this is the one
      // place the guided tour is armed. Signing in never sets it.
      await markFirstRunPending();

      // New accounts have no vehicle yet, so onboarding continues there.
      router.replace('/(auth)/addVehicle');
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.unexpected';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  return (
    <Screen
      scroll
      gap="xl"
      header={{ titleTx: 'auth.signUp' }}
      footer={
        <View
          style={{
            alignItems: 'center',
            columnGap: SPACING.xs,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text variant="bodySm" color="textSecondary" tx="auth.haveAccount" />
          <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
            <Text variant="label" color="primary" tx="auth.signIn" />
          </Pressable>
        </View>
      }
    >
      <View style={{ rowGap: SPACING.xs }}>
        <Text variant="display" tx="auth.signUpTitle" />
        <Text variant="body" color="textSecondary" tx="auth.signUpSubtitle" />
      </View>

      <View style={{ rowGap: SPACING.lg }}>
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <FormInput
            control={control}
            name="firstName"
            labelTx="auth.firstName"
            autoCapitalize="words"
            textContentType="givenName"
            required
            containerStyle={{ flex: 1 }}
          />
          <FormInput
            control={control}
            name="lastName"
            labelTx="auth.lastName"
            autoCapitalize="words"
            textContentType="familyName"
            required
            containerStyle={{ flex: 1 }}
          />
        </View>

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
        tx="auth.signUp"
        size="lg"
        fullWidth
        loading={isLoading}
        onPress={handleSubmit(onSubmit)}
      />
    </Screen>
  );
}
