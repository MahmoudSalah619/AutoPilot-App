import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AuthScreenWrapper from '@/components/templates/AuthScreenWrapper';
import { Controller, useForm } from 'react-hook-form';
import { Checkbox, FormInput } from '@/components/molecules/common';
import { Button, Text } from '@/components/atoms';
import GLOBAL_STYLES from '@/constants/GlobalStyles';
import { useLazyGetUserInfoQuery, useLoginMutation } from '@/apis/services/auth';
import Biometric from '@/components/organisms/scoped/auth/biometric';
import styles from './styles';
import loginHandler from '@/utils/loginHandler';

const Login = () => {
  const {
    control,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm({});
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [getUserInfo] = useLazyGetUserInfoQuery();

  const handleGetMe = (token: string) => {
    getUserInfo(token)
      .unwrap()
      .then((response) => {
        console.log('User info retrieved successfully:', response);
        loginHandler({ userInfo: response, token, rememberMe: getValues('remember_me') });
      })
      .catch((error) => {
        console.error('Failed to retrieve user info:', error);
      });
  };

  const onSubmit = () => {
    const { email, password } = getValues();

    login({ email, password })
      .unwrap()
      .then((response) => {
        console.log('Login successful:', response);
        handleGetMe(response.access_token);
        router.replace('/(main)/(tabs)/Home');
      })
      .catch((error) => {
        console.error('Login failed:', error);
      });
  };

  return (
    <AuthScreenWrapper justifyContent="space-between" isScrollable>
      <View>
        <View style={{ marginBottom: 24 }}>
          <FormInput
            name="email"
            placeholder="Email"
            control={control}
            required
            error={typeof errors.email?.message === 'string' ? errors.email.message : undefined}
          />
          <FormInput
            name="password"
            placeholder="Password"
            secureTextEntry
            control={control}
            required
            error={
              typeof errors.password?.message === 'string' ? errors.password.message : undefined
            }
          />
          <View style={GLOBAL_STYLES.rowJustifyBetween}>
            <Controller
              control={control}
              name="remember_me"
              render={({ field: { onChange, value } }) => (
                <Checkbox label="Remember me" onChange={onChange} value={value} />
              )}
            />
            <TouchableOpacity>
              <Text color="black" size={12}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Button
          title={isLoading ? 'Signing in...' : 'Login'}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      </View>
      <Biometric />
      {/* <SeperateLine /> */}
      {/* <View style={GLOBAL_STYLES.gap8}>
        <AppleRegistarationButton />
        <GoogleRegisterationButton />
        <FacebookRegisterationButton />
      </View> */}
      <View style={[GLOBAL_STYLES.rowCenter, GLOBAL_STYLES.gap4]}>
        <Text>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text weight={600} color="primary" style={styles.underlined}>
            Signup
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenWrapper>
  );
};

export default Login;
