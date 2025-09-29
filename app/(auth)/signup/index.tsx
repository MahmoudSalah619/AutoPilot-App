import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/molecules/common';
import { Button } from '@/components/atoms';
import AuthScreenWrapper from '@/components/templates/AuthScreenWrapper';
import { useSignupMutation } from '@/apis/services/auth';

const SignUp = () => {
  const router = useRouter();
  const [signup] = useSignupMutation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({});

  const password = watch('password');

  const onSubmit = (data: any) => {
    console.log(data);
    signup(data)
      .unwrap()
      .then((res) => {
        console.log(res, 'signup res');
        router.push({ pathname: '/(auth)/addVehicle', params: { res: JSON.stringify(res) } });
      })
      .catch((error) => {
        console.error('Signup failed:', error.data.message);
      });
  };
  return (
    <AuthScreenWrapper justifyContent="space-between" isScrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Here we go!</Text>
        <Text style={styles.title}>Fill in your details</Text>
        <View style={styles.formContainer}>
          <FormInput
            label="First Name"
            name="firstName"
            placeholder="First Name"
            control={control}
            required
            rules={{
              required: 'Please Enter your first name',
            }}
            error={
              typeof errors.firstName?.message === 'string' ? errors.firstName.message : undefined
            }
          />
          <FormInput
            label="Last Name"
            name="lastName"
            placeholder="Last Name"
            rules={{
              required: 'Please Enter your last name',
            }}
            control={control}
            required
            error={
              typeof errors.lastName?.message === 'string' ? errors.lastName.message : undefined
            }
          />
          <FormInput
            label="Email"
            name="email"
            placeholder="Email"
            control={control}
            required
            rules={{
              required: 'Make sure to provide your email',
              validate: (value: string) =>
                (value.includes('@') && value.includes('.com')) || 'Invalid email address',
            }}
            error={typeof errors.email?.message === 'string' ? errors.email.message : undefined}
          />
          <FormInput
            label="Password"
            name="password"
            placeholder="Password"
            secureTextEntry
            control={control}
            required
            rules={{
              required: 'Please enter a password',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long',
              },
              validate: (value: string) => {
                if (!/[A-Z]/.test(value)) {
                  return 'Password must contain at least one uppercase letter';
                }
                if (!/[a-z]/.test(value)) {
                  return 'Password must contain at least one lowercase letter';
                }
                return true;
              },
              // Additional validation rules can be added here
            }}
            error={
              typeof errors.password?.message === 'string' ? errors.password.message : undefined
            }
          />
          <FormInput
            label="Re enter your Password"
            name="passwordconfirm"
            placeholder="Password"
            secureTextEntry
            control={control}
            required
            rules={{
              required: 'Please confirm your password',
              validate: (value: string) => value === password || 'Passwords do not match',
            }}
            error={
              typeof errors.passwordconfirm?.message === 'string'
                ? errors.passwordconfirm.message
                : undefined
            }
          />
          <Button
            title={'Sign Up'}
            onPress={handleSubmit(onSubmit)}
            // disabled={isLoading}
          />
        </View>
      </View>
    </AuthScreenWrapper>
  );
};

export default SignUp;
